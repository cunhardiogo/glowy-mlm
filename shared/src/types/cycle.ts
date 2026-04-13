export type CicloStatus = 'ABERTO' | 'FECHANDO' | 'FECHADO' | 'ERRO';

export interface Ciclo {
  ref_mes: string;
  status: CicloStatus;
  abertura_em: Date;
  fechamento_em: Date | null;
  erro_log: string | null;
}

export interface Snapshot {
  id: string;
  ciclo_ref: string;
  user_id: string;
  graduacao: string;
  pb_pessoal: number;
  pb_grupo: number;
  bonus_total_centavos: number;
  criado_em: Date;
}
