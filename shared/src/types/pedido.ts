export type PedidoTipo = 'KIT_INICIAL' | 'UPGRADE' | 'RECOMPRA';
export type PedidoStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO';

export interface Pedido {
  id: string;
  user_id: string;
  tipo: PedidoTipo;
  kit: 'STANDARD' | 'PREMIUM' | null;
  valor_centavos: number;
  pontos_graduacao: number;
  pontos_bonificaveis: number;
  status: PedidoStatus;
  pago_em: string | null;
  ciclo_ref: string | null;
  gateway_ref: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}
