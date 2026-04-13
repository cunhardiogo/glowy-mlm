import type { PoolClient } from 'pg';
import { EQUIPARACAO_PCT, GRADUACOES } from '@glowy/shared';
import type { GraduacaoNome } from '@glowy/shared';

interface EIQualificado {
  user_id: string;
  graduacao: GraduacaoNome;
  pb_pessoal: number;
  patrocinador_id: string | null;
}

export async function calcularBonusEquiparacao(
  cicloRef: string,
  client: PoolClient
): Promise<void> {
  // Busca todos os EI ativos do ciclo com graduação ≥ BRONZE
  const { rows: qualificados } = await client.query<EIQualificado & { path: string }>(
    `SELECT q.user_id, q.graduacao, q.pb_pessoal, u.patrocinador_id, u.path::text AS path
       FROM qualificacoes q
       JOIN users u ON u.id = q.user_id
      WHERE q.ciclo_ref = $1::date
        AND q.ativo = TRUE
        AND q.graduacao <> 'NENHUMA'`,
    [cicloRef]
  );

  // 1. Cashback (sobre volume pessoal de cada EI ativo)
  for (const ei of qualificados) {
    if (ei.pb_pessoal <= 0) continue;
    const pct = EQUIPARACAO_PCT[ei.graduacao] ?? 0;
    if (pct <= 0) continue;
    const baseCentavos = ei.pb_pessoal * 300;
    const valor = Math.floor((baseCentavos * pct) / 100);
    if (valor <= 0) continue;

    await client.query(
      `INSERT INTO bonus_lancamentos
         (ciclo_ref, beneficiario_id, origem_user_id, pedido_id, tipo, nivel, percentual, base_centavos, valor_centavos, status, meta)
       VALUES ($1::date, $2, $2, NULL, 'EQUIPARACAO', 0, $3, $4, $5, 'PROVISIONADO', '{"subtipo":"CASHBACK"}')
       ON CONFLICT DO NOTHING`,
      [cicloRef, ei.user_id, pct, baseCentavos, valor]
    );
  }

  // 2. Diferencial stair-step
  // Para cada EI D (origem do volume), subir a cadeia de ascendentes por path
  for (const d of qualificados) {
    if (d.pb_pessoal <= 0) continue;
    const baseCentavos = d.pb_pessoal * 300;
    const pctD = EQUIPARACAO_PCT[d.graduacao] ?? 0;

    // Subir pela cadeia de ancestors pelo path ltree
    // path de D: "a.b.c.d" → ancestors são prefixos "a", "a.b", "a.b.c"
    const parts = d.path.split('.');
    let pctAcumulado = pctD;

    for (let i = parts.length - 2; i >= 0; i--) {
      const ancestorPath = parts.slice(0, i + 1).join('.');

      const { rows: ancestRows } = await client.query<{
        id: string;
        patrocinador_id: string | null;
        ativo_ciclo_atual: boolean;
        graduacao_ciclo_atual: GraduacaoNome;
      }>(
        `SELECT u.id, u.patrocinador_id, u.ativo_ciclo_atual, u.graduacao_ciclo_atual
           FROM users u
          WHERE u.path = $1::ltree`,
        [ancestorPath]
      );
      if (!ancestRows.length) continue;
      const anc = ancestRows[0];

      // Só recebe se ativo no ciclo
      if (!anc.ativo_ciclo_atual) continue;

      const pctAnc = EQUIPARACAO_PCT[anc.graduacao_ciclo_atual] ?? 0;
      const delta = pctAnc - pctAcumulado;
      if (delta <= 0) continue;

      const valor = Math.floor((baseCentavos * delta) / 100);
      if (valor <= 0) continue;

      await client.query(
        `INSERT INTO bonus_lancamentos
           (ciclo_ref, beneficiario_id, origem_user_id, pedido_id, tipo, nivel, percentual, base_centavos, valor_centavos, status, meta)
         VALUES ($1::date, $2, $3, NULL, 'EQUIPARACAO', $4, $5, $6, $7, 'PROVISIONADO', '{"subtipo":"DIFERENCIAL"}')
         ON CONFLICT DO NOTHING`,
        [cicloRef, anc.id, d.user_id, i + 1, delta, baseCentavos, valor]
      );

      pctAcumulado = pctAnc;
      if (pctAcumulado >= 15) break; // teto máximo de equiparação
    }
  }
}
