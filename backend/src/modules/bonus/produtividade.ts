import type { PoolClient } from 'pg';
import {
  NIVEL_MAX_PRODUTIVIDADE,
  percentProdutividade,
  GRADUACOES,
} from '@glowy/shared';
import { uplineComprimido } from './compressao.js';

export async function calcularBonusProdutividade(
  cicloRef: string,
  client: PoolClient
): Promise<void> {
  // Busca todos os pontos_movimento de RECOMPRA do ciclo (origem de PB)
  const { rows: movRows } = await client.query<{
    user_id: string;
    pb: number;
    pedido_id: string | null;
  }>(
    `SELECT pm.user_id, pm.pb, pm.pedido_id
       FROM pontos_movimento pm
      WHERE pm.ciclo_ref = $1::date AND pm.pb > 0 AND pm.origem = 'RECOMPRA'`,
    [cicloRef]
  );

  const hoje = new Date();

  for (const mov of movRows) {
    if (mov.pb <= 0) continue;
    // Base em centavos: 1 PB = R$3 = 300 centavos
    const baseCentavos = mov.pb * 300;

    const upline = await uplineComprimido(mov.user_id, NIVEL_MAX_PRODUTIVIDADE.PREMIUM, client);

    for (const u of upline) {
      const kitPat = u.kit_atual ?? 'STANDARD';
      const maxNivel = kitPat === 'PREMIUM' ? NIVEL_MAX_PRODUTIVIDADE.PREMIUM : NIVEL_MAX_PRODUTIVIDADE.STANDARD;
      if (u.nivel > maxNivel) break;

      // Níveis 6-10 exigem PREMIUM qualificado em PRATA
      if (u.nivel > NIVEL_MAX_PRODUTIVIDADE.STANDARD) {
        const grad = GRADUACOES[u.graduacao_reconhecimento];
        if (!grad || grad.nivel < GRADUACOES.PRATA.nivel) continue;
      }

      const pcts = percentProdutividade(kitPat as 'STANDARD' | 'PREMIUM');
      const pct = pcts[u.nivel] ?? 0;
      if (pct <= 0) continue;
      const valor = Math.floor((baseCentavos * pct) / 100);
      if (valor <= 0) continue;

      await client.query(
        `INSERT INTO bonus_lancamentos
           (ciclo_ref, beneficiario_id, origem_user_id, pedido_id, tipo, nivel, percentual, base_centavos, valor_centavos, status)
         VALUES ($1::date, $2, $3, $4, 'PRODUTIVIDADE', $5, $6, $7, $8, 'PROVISIONADO')
         ON CONFLICT DO NOTHING`,
        [cicloRef, u.id, mov.user_id, mov.pedido_id, u.nivel, pct, baseCentavos, valor]
      );
    }
  }
}
