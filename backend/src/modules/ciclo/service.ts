import type { PoolClient } from 'pg';
import { pool, supabaseAdmin } from '../../config/db.js';
import { qualificarCiclo } from '../qualificacao/engine.js';
import { calcularBonusPrimeiroPedido } from '../bonus/primeiroPedido.js';
import { calcularBonusUpgrade } from '../bonus/upgrade.js';
import { calcularBonusProdutividade } from '../bonus/produtividade.js';
import { calcularBonusEquiparacao } from '../bonus/equiparacao.js';
import { logger } from '../../config/logger.js';
import { HttpError } from '../../middleware/errorHandler.js';

function cicloAnterior(refMes: string): string {
  const [y, m] = refMes.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 2, 1)); // m-2 porque m já é 1-based
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export async function abrirCiclo(refMes: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('ciclos')
    .upsert({ ref_mes: refMes, status: 'ABERTO', aberto_em: new Date().toISOString() }, { onConflict: 'ref_mes', ignoreDuplicates: true });
  if (error) throw error;
  logger.info({ refMes }, 'ciclo aberto');
}

export async function fecharCiclo(refMes: string): Promise<void> {
  logger.info({ refMes }, 'fecharCiclo: iniciado');
  const client = await pool.connect();

  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // Lock e validação do ciclo
    const { rows: cicloRows } = await client.query(
      `SELECT ref_mes, status FROM ciclos WHERE ref_mes = $1::date FOR UPDATE`,
      [refMes]
    );
    if (!cicloRows.length) {
      // Criar o ciclo se não existir
      await client.query(
        `INSERT INTO ciclos (ref_mes, status, aberto_em) VALUES ($1::date, 'PROCESSANDO', NOW())`,
        [refMes]
      );
    } else {
      const st = cicloRows[0].status;
      if (st === 'FECHADO') throw new HttpError(409, 'JA_FECHADO', 'Ciclo já fechado');
      if (st === 'PROCESSANDO') throw new HttpError(409, 'EM_ANDAMENTO', 'Fechamento em andamento');
      await client.query(
        `UPDATE ciclos SET status = 'PROCESSANDO' WHERE ref_mes = $1::date`,
        [refMes]
      );
    }

    // 1. Qualificação
    await qualificarCiclo(refMes, client);

    // 2. Bônus de Primeiro Pedido e Upgrade (por pedido)
    const { rows: pedidos } = await client.query<{ id: string; tipo: string }>(
      `SELECT id, tipo FROM pedidos
        WHERE ciclo_ref = $1::date AND status = 'PAGO' AND tipo IN ('KIT_INICIAL', 'UPGRADE')`,
      [refMes]
    );
    for (const p of pedidos) {
      if (p.tipo === 'KIT_INICIAL') await calcularBonusPrimeiroPedido(p.id, client);
      else if (p.tipo === 'UPGRADE') await calcularBonusUpgrade(p.id, client);
    }

    // 3. Produtividade
    await calcularBonusProdutividade(refMes, client);

    // 4. Equiparação
    await calcularBonusEquiparacao(refMes, client);

    // 5. Aplicar tetos globais
    await aplicarTetosGlobais(refMes, client);

    // 6. Creditar carteiras — liberar bônus provisionados do MÊS ANTERIOR
    const anterior = cicloAnterior(refMes);
    await client.query(
      `UPDATE bonus_lancamentos
          SET status = 'LIBERADO'
        WHERE ciclo_ref = $1::date AND status = 'PROVISIONADO'`,
      [anterior]
    );

    // Creditar saldo na carteira dos beneficiários do mês anterior
    await client.query(
      `INSERT INTO carteira (user_id, saldo_liberado_centavos, saldo_provisionado_centavos, total_recebido_centavos)
       SELECT beneficiario_id,
              SUM(valor_centavos),
              0,
              SUM(valor_centavos)
         FROM bonus_lancamentos
        WHERE ciclo_ref = $1::date AND status = 'LIBERADO'
        GROUP BY beneficiario_id
       ON CONFLICT (user_id) DO UPDATE
         SET saldo_liberado_centavos = carteira.saldo_liberado_centavos + EXCLUDED.saldo_liberado_centavos,
             total_recebido_centavos = carteira.total_recebido_centavos + EXCLUDED.total_recebido_centavos,
             atualizado_em = NOW()`,
      [anterior]
    );

    // Marcar provisionados do ciclo atual na carteira
    await client.query(
      `INSERT INTO carteira (user_id, saldo_liberado_centavos, saldo_provisionado_centavos, total_recebido_centavos)
       SELECT beneficiario_id,
              0,
              SUM(valor_centavos),
              0
         FROM bonus_lancamentos
        WHERE ciclo_ref = $1::date AND status = 'PROVISIONADO'
        GROUP BY beneficiario_id
       ON CONFLICT (user_id) DO UPDATE
         SET saldo_provisionado_centavos = carteira.saldo_provisionado_centavos + EXCLUDED.saldo_provisionado_centavos,
             atualizado_em = NOW()`,
      [refMes]
    );

    // 7. Fechar ciclo
    await client.query(
      `UPDATE ciclos
          SET status = 'FECHADO', fechado_em = NOW(), total_bonus_centavos = (
            SELECT COALESCE(SUM(valor_centavos), 0) FROM bonus_lancamentos WHERE ciclo_ref = $1::date
          )
        WHERE ref_mes = $1::date`,
      [refMes]
    );

    await client.query('COMMIT');
    logger.info({ refMes }, 'fecharCiclo: concluído');
  } catch (err) {
    await client.query('ROLLBACK');
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(
      `UPDATE ciclos SET status = 'ERRO', log = $2 WHERE ref_mes = $1::date`,
      [refMes, JSON.stringify({ error: msg, ts: new Date().toISOString() })]
    ).catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function aplicarTetosGlobais(cicloRef: string, client: PoolClient): Promise<void> {
  const TETOS: Record<string, number> = {
    PRIMEIRO_PEDIDO: 0.5,
    UPGRADE: 0.5,
    PRODUTIVIDADE: 0.5,
    EQUIPARACAO: 0.15,
  };

  for (const [tipo, teto] of Object.entries(TETOS)) {
    let volumeBase = 0;
    if (tipo === 'PRIMEIRO_PEDIDO') {
      const { rows } = await client.query<{ total: string }>(
        `SELECT COALESCE(SUM(valor_centavos), 0)::bigint AS total FROM pedidos WHERE ciclo_ref = $1::date AND tipo = 'KIT_INICIAL' AND status = 'PAGO'`,
        [cicloRef]
      );
      volumeBase = Number(rows[0]?.total ?? 0);
    } else if (tipo === 'UPGRADE') {
      const { rows } = await client.query<{ total: string }>(
        `SELECT COALESCE(SUM(valor_centavos), 0)::bigint AS total FROM pedidos WHERE ciclo_ref = $1::date AND tipo = 'UPGRADE' AND status = 'PAGO'`,
        [cicloRef]
      );
      volumeBase = Number(rows[0]?.total ?? 0);
    } else {
      // Produtividade e Equiparação: base = PB × 300
      const { rows } = await client.query<{ total: string }>(
        `SELECT COALESCE(SUM(pb), 0)::bigint AS total FROM pontos_movimento WHERE ciclo_ref = $1::date AND pb > 0`,
        [cicloRef]
      );
      volumeBase = Number(rows[0]?.total ?? 0) * 300;
    }

    if (volumeBase <= 0) continue;
    const tetoValor = Math.floor(volumeBase * teto);

    const { rows: bonusRows } = await client.query<{ total: string }>(
      `SELECT COALESCE(SUM(valor_centavos), 0)::bigint AS total FROM bonus_lancamentos WHERE ciclo_ref = $1::date AND tipo = $2 AND status = 'PROVISIONADO'`,
      [cicloRef, tipo]
    );
    const totalBonus = Number(bonusRows[0]?.total ?? 0);

    if (totalBonus > tetoValor && totalBonus > 0) {
      const fator = tetoValor / totalBonus;
      await client.query(
        `UPDATE bonus_lancamentos
            SET valor_centavos = GREATEST(1, FLOOR(valor_centavos * $3)),
                meta = COALESCE(meta, '{}'::jsonb) || jsonb_build_object('fator_teto', $3)
          WHERE ciclo_ref = $1::date AND tipo = $2 AND status = 'PROVISIONADO'`,
        [cicloRef, tipo, fator]
      );
    }
  }
}
