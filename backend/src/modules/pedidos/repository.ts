import { supabaseAdmin } from '../../config/db.js';
import type { Pedido, PedidoTipo, PedidoStatus } from '@glowy/shared';

export async function criarPedido(params: {
  user_id: string;
  tipo: PedidoTipo;
  kit?: 'STANDARD' | 'PREMIUM' | null;
  valor_centavos?: number;
}): Promise<Pedido> {
  const { data, error } = await supabaseAdmin.rpc('criar_pedido', {
    p_user_id: params.user_id,
    p_tipo: params.tipo,
    p_kit: params.kit ?? null,
    p_valor_centavos: params.valor_centavos ?? 0,
  });
  if (error) throw error;
  return (data as unknown[])[0] as Pedido;
}

export async function atualizarStatus(
  pedidoId: string,
  status: PedidoStatus,
  gatewayRef?: string
): Promise<Pedido> {
  const update: Record<string, unknown> = { status };
  if (gatewayRef) update.gateway_ref = gatewayRef;
  if (status === 'PAGO') update.pago_em = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .update(update)
    .eq('id', pedidoId)
    .select()
    .single();
  if (error) throw error;
  return data as Pedido;
}

export async function listarPedidosUser(userId: string): Promise<Pedido[]> {
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Pedido[]) ?? [];
}

export async function getPedido(pedidoId: string): Promise<Pedido | null> {
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('*')
    .eq('id', pedidoId)
    .maybeSingle();
  if (error) throw error;
  return (data as Pedido) ?? null;
}
