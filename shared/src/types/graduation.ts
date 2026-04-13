import type { GraduacaoNome } from './user.js';

export interface Graduacao {
  nome: GraduacaoNome;
  nivel: number;
  pg_requerido: number;
  apm: number;
  vml: number;
  equiparacao_pct: number;
}

export interface Qualificacao {
  ciclo_ref: string;
  user_id: string;
  ativo: boolean;
  apm_requerido: number;
  pb_pessoal: number;
  pb_grupo_total: number;
  pb_grupo_qualificado: number;
  maior_linha_pb: number;
  graduacao: GraduacaoNome;
  vml_percentual: number | null;
  detalhes: Record<string, unknown> | null;
}
