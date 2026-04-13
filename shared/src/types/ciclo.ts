export type CicloStatus = 'ABERTO' | 'PROCESSANDO' | 'FECHADO' | 'ERRO';

export interface Ciclo {
  ref_mes: string;
  status: CicloStatus;
  aberto_em: string;
  fechado_em: string | null;
  total_bonus_centavos: number;
  log: Record<string, unknown> | null;
}
