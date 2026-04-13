export type BonusTipo =
  | 'PRIMEIRO_PEDIDO'
  | 'UPGRADE'
  | 'PRODUTIVIDADE'
  | 'EQUIPARACAO';

export type LancamentoStatus = 'PROVISIONADO' | 'LIBERADO' | 'PAGO' | 'CANCELADO';

export interface BonusLancamento {
  id: string;
  beneficiario_id: string;
  origem_user_id: string | null;
  pedido_id: string | null;
  tipo: BonusTipo;
  ciclo_ref: string;
  nivel: number | null;
  percentual: number;
  base_centavos: number;
  valor_centavos: number;
  status: LancamentoStatus;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ResumoBonus {
  ciclo_ref: string;
  primeiro_pedido_centavos: number;
  upgrade_centavos: number;
  produtividade_centavos: number;
  equiparacao_centavos: number;
  total_centavos: number;
  por_tipo: Array<{ tipo: BonusTipo; total_centavos: number }>;
}
