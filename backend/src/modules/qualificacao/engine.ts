import type { PoolClient } from 'pg';
import {
  GRADUACOES,
  GRADUACOES_ORDENADAS,
  APM_POR_GRADUACAO,
  graduacaoMaior,
} from '@glowy/shared';
import type { GraduacaoNome } from '@glowy/shared';
import { logger } from '../../config/logger.js';

interface EIRow {
  id: string;
  patrocinador_id: string | null;
  path: string;
  profundidade: number;
  graduacao_reconhecimento: GraduacaoNome;
  kit_atual: 'STANDARD' | 'PREMIUM' | null;
}

export async function qualificarCiclo(cicloRef: string, client: PoolClient): Promise<void> {
  logger.info({ cicloRef }, 'qualificarCiclo: iniciando');

  // 1. Buscar todos os EIs
  const { rows: eis } = await client.query<EIRow>(
    `SELECT id, patrocinador_id, path::text AS path, nlevel(path) - 1 AS profundidade,
            graduacao_reconhecimento, kit_atual
       FROM users
      WHERE tipo = 'EI' AND status_ativo = TRUE`,
  );

  // 2. Buscar PG e PB pessoal por EI no ciclo
  const { rows: pontosRows } = await client.query<{ user_id: string; pg_total: number; pb_total: number }>(
    `SELECT user_id,
            COALESCE(SUM(pg), 0)::int AS pg_total,
            COALESCE(SUM(pb), 0)::int AS pb_total
       FROM pontos_movimento
      WHERE ciclo_ref = $1::date
      GROUP BY user_id`,
    [cicloRef]
  );

  const pgPessoal = new Map<string, number>();
  const pbPessoal = new Map<string, number>();
  for (const r of pontosRows) {
    pgPessoal.set(r.user_id, r.pg_total);
    pbPessoal.set(r.user_id, r.pb_total);
  }

  // Construir mapa id → row e filhos
  const eiMap = new Map<string, EIRow>();
  const filhosMap = new Map<string, string[]>();
  for (const ei of eis) {
    eiMap.set(ei.id, ei);
    if (ei.patrocinador_id) {
      if (!filhosMap.has(ei.patrocinador_id)) filhosMap.set(ei.patrocinador_id, []);
      filhosMap.get(ei.patrocinador_id)!.push(ei.id);
    }
  }

  // Ordenar do mais profundo para o menos profundo (bottom-up)
  const ordenados = [...eis].sort((a, b) => b.profundidade - a.profundidade);

  // Mapas de resultado
  const pgGrupoTotal = new Map<string, number>(); // volume total da subárvore (excl. próprio pg)
  const graduacaoAlcancada = new Map<string, GraduacaoNome>();
  const ativoMap = new Map<string, boolean>();

  for (const ei of ordenados) {
    const pg = pgPessoal.get(ei.id) ?? 0;
    const pb = pbPessoal.get(ei.id) ?? 0;

    // APM: baseado na graduação reconhecimento (maior já atingida)
    const apmReq = APM_POR_GRADUACAO[ei.graduacao_reconhecimento] ?? 50;
    const ativo = pg >= apmReq;
    ativoMap.set(ei.id, ativo);

    // Volume do grupo: pg pessoal + soma de pg_grupo dos filhos (incluindo inativos)
    const filhos = filhosMap.get(ei.id) ?? [];
    let pgGrupoFilhos = 0;
    const volumesPorLinha: number[] = [];

    for (const filhoId of filhos) {
      const pgFilho = pgPessoal.get(filhoId) ?? 0;
      const pgFilhoGrupo = pgGrupoTotal.get(filhoId) ?? 0;
      const volumeLinha = pgFilho + pgFilhoGrupo;
      pgGrupoFilhos += volumeLinha;
      volumesPorLinha.push(volumeLinha);
    }
    pgGrupoTotal.set(ei.id, pgGrupoFilhos);

    const pgGrupoComPessoal = pg + pgGrupoFilhos;

    // Determinar graduação por VML
    let melhorGraduacao: GraduacaoNome = 'NENHUMA';
    if (ativo) {
      for (const g of [...GRADUACOES_ORDENADAS].reverse()) {
        if (g.nome === 'NENHUMA') continue;
        if (pgGrupoComPessoal < g.pg_requerido) continue;
        if (pg < APM_POR_GRADUACAO[g.nome]) continue;

        // Aplicar VML
        const limitePorLinha = Math.floor((g.pg_requerido * g.vml) / 100);
        const pgPessoalVml = Math.min(pg, limitePorLinha);
        const pgGrupoVml = volumesPorLinha.reduce((acc, v) => acc + Math.min(v, limitePorLinha), 0);
        const pgQualificado = pgPessoalVml + pgGrupoVml;

        if (pgQualificado >= g.pg_requerido) {
          melhorGraduacao = g.nome;
          break;
        }
      }
    }
    graduacaoAlcancada.set(ei.id, melhorGraduacao);

    // Calcular maior linha PB (para qualificacoes.maior_linha_pb)
    let maiorLinhaPb = 0;
    for (const filhoId of filhos) {
      const pbFilho = pbPessoal.get(filhoId) ?? 0;
      if (pbFilho > maiorLinhaPb) maiorLinhaPb = pbFilho;
    }

    // PG grupo qualificado (com VML aplicado para a graduação alcançada)
    const gradObj = GRADUACOES[melhorGraduacao];
    let pgGrupoQualificado = 0;
    if (melhorGraduacao !== 'NENHUMA') {
      const limitePorLinha = Math.floor((gradObj.pg_requerido * gradObj.vml) / 100);
      pgGrupoQualificado = Math.min(pg, limitePorLinha) +
        volumesPorLinha.reduce((acc, v) => acc + Math.min(v, limitePorLinha), 0);
    }
    const pbGrupoTotal = (pbPessoal.get(ei.id) ?? 0) + filhos.reduce((acc, fId) => acc + (pbPessoal.get(fId) ?? 0), 0);

    // Upsert em qualificacoes
    await client.query(
      `INSERT INTO qualificacoes
         (ciclo_ref, user_id, ativo, apm_requerido, pb_pessoal, pb_grupo_total, pb_grupo_qualificado, maior_linha_pb, graduacao, vml_percentual)
       VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9::graduacao, $10)
       ON CONFLICT (ciclo_ref, user_id) DO UPDATE
         SET ativo = EXCLUDED.ativo,
             apm_requerido = EXCLUDED.apm_requerido,
             pb_pessoal = EXCLUDED.pb_pessoal,
             pb_grupo_total = EXCLUDED.pb_grupo_total,
             pb_grupo_qualificado = EXCLUDED.pb_grupo_qualificado,
             maior_linha_pb = EXCLUDED.maior_linha_pb,
             graduacao = EXCLUDED.graduacao,
             vml_percentual = EXCLUDED.vml_percentual`,
      [
        cicloRef, ei.id, ativo, apmReq, pb, pbGrupoTotal, pgGrupoQualificado,
        maiorLinhaPb, melhorGraduacao, gradObj?.vml ?? 100
      ]
    );

    // Atualizar users: ativo_ciclo_atual, graduacao_ciclo_atual, graduacao_reconhecimento (maior)
    const novaGradRecon = graduacaoMaior(melhorGraduacao, ei.graduacao_reconhecimento);
    await client.query(
      `UPDATE users
          SET ativo_ciclo_atual = $2,
              graduacao_ciclo_atual = $3::graduacao,
              graduacao_reconhecimento = $4::graduacao
        WHERE id = $1`,
      [ei.id, ativo, melhorGraduacao, novaGradRecon]
    );
  }

  logger.info({ cicloRef, total: eis.length }, 'qualificarCiclo: concluído');
}
