import type { GraduacaoNome } from '../types/user.js';
import type { Graduacao } from '../types/graduation.js';

export const GRADUACOES: Record<GraduacaoNome, Graduacao> = {
  NENHUMA:          { nome: 'NENHUMA',          nivel: 0,  pg_requerido: 0,       apm: 0,   vml: 100, equiparacao_pct: 0  },
  BRONZE:           { nome: 'BRONZE',           nivel: 1,  pg_requerido: 2000,    apm: 50,  vml: 100, equiparacao_pct: 3  },
  PRATA:            { nome: 'PRATA',            nivel: 2,  pg_requerido: 6000,    apm: 50,  vml: 60,  equiparacao_pct: 6  },
  OURO:             { nome: 'OURO',             nivel: 3,  pg_requerido: 12000,   apm: 100, vml: 60,  equiparacao_pct: 10 },
  SAFIRA:           { nome: 'SAFIRA',           nivel: 4,  pg_requerido: 24000,   apm: 100, vml: 50,  equiparacao_pct: 15 },
  ESMERALDA:        { nome: 'ESMERALDA',        nivel: 5,  pg_requerido: 50000,   apm: 100, vml: 45,  equiparacao_pct: 15 },
  DIAMANTE:         { nome: 'DIAMANTE',         nivel: 6,  pg_requerido: 100000,  apm: 150, vml: 40,  equiparacao_pct: 15 },
  DUPLO_DIAMANTE:   { nome: 'DUPLO_DIAMANTE',   nivel: 7,  pg_requerido: 200000,  apm: 150, vml: 35,  equiparacao_pct: 15 },
  TRIPLO_DIAMANTE:  { nome: 'TRIPLO_DIAMANTE',  nivel: 8,  pg_requerido: 400000,  apm: 150, vml: 30,  equiparacao_pct: 15 },
  IMPERIAL:         { nome: 'IMPERIAL',         nivel: 9,  pg_requerido: 1000000, apm: 200, vml: 25,  equiparacao_pct: 15 },
  EMBAIXADOR:       { nome: 'EMBAIXADOR',       nivel: 10, pg_requerido: 2000000, apm: 200, vml: 20,  equiparacao_pct: 15 },
  EMBAIXADOR_GLOBAL:{ nome: 'EMBAIXADOR_GLOBAL',nivel: 11, pg_requerido: 5000000, apm: 200, vml: 15,  equiparacao_pct: 15 },
};

export const GRADUACOES_ORDENADAS: Graduacao[] = Object.values(GRADUACOES).sort((a, b) => a.nivel - b.nivel);

export const GRADUACOES_SEM_NENHUMA: Graduacao[] = GRADUACOES_ORDENADAS.filter(g => g.nome !== 'NENHUMA');

export function graduacaoPorNivel(n: number): Graduacao {
  return GRADUACOES_ORDENADAS.find(g => g.nivel === n) ?? GRADUACOES.NENHUMA;
}

export function melhorGraduacaoQueSuportam(pgGrupoQualificado: number): Graduacao {
  let melhor: Graduacao = GRADUACOES.NENHUMA;
  for (const g of GRADUACOES_ORDENADAS) {
    if (pgGrupoQualificado >= g.pg_requerido) melhor = g;
  }
  return melhor;
}

export function graduacaoMaior(a: GraduacaoNome, b: GraduacaoNome): GraduacaoNome {
  return GRADUACOES[a].nivel >= GRADUACOES[b].nivel ? a : b;
}
