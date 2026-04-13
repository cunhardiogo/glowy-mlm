import { supabaseAdmin } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import * as repo from './repository.js';
import type { Pedido } from '@glowy/shared';

async function getUser(userId: string) {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
  if (error || !data) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
  return data;
}

export async function criarKitInicial(
  userId: string,
  kit: 'STANDARD' | 'PREMIUM'
): Promise<{ pedido: Pedido; instrucoesPix: string }> {
  const u = await getUser(userId);
  if (u.kit_atual) throw new HttpError(409, 'KIT_JA_ATIVO', 'Usuário já possui kit ativo');
  const pedido = await repo.criarPedido({ user_id: userId, tipo: 'KIT_INICIAL', kit });
  return {
    pedido,
    instrucoesPix: `Chave PIX: 03.085.075/0001-00 (G Brasil Nutrition Ltda). Valor: R$ ${(pedido.valor_centavos / 100).toFixed(2)}. Ref: ${pedido.id}`,
  };
}

export async function criarUpgrade(userId: string): Promise<{ pedido: Pedido; instrucoesPix: string }> {
  const u = await getUser(userId);
  if (u.kit_atual !== 'STANDARD') throw new HttpError(400, 'UPGRADE_INVALIDO', 'Upgrade só disponível para kit STANDARD');
  const pedido = await repo.criarPedido({ user_id: userId, tipo: 'UPGRADE', kit: 'PREMIUM' });
  return {
    pedido,
    instrucoesPix: `Chave PIX: 03.085.075/0001-00. Valor: R$ ${(pedido.valor_centavos / 100).toFixed(2)}. Ref: ${pedido.id}`,
  };
}

export async function criarRecompra(
  userId: string,
  valorCentavos: number
): Promise<{ pedido: Pedido; instrucoesPix: string }> {
  const u = await getUser(userId);
  if (!u.kit_atual) throw new HttpError(400, 'SEM_KIT', 'Usuário não possui kit ativo');
  const pedido = await repo.criarPedido({ user_id: userId, tipo: 'RECOMPRA', kit: null, valor_centavos: valorCentavos });
  return {
    pedido,
    instrucoesPix: `Chave PIX: 03.085.075/0001-00. Valor: R$ ${(pedido.valor_centavos / 100).toFixed(2)}. Ref: ${pedido.id}`,
  };
}

export async function confirmarPagamento(pedidoId: string, gatewayRef: string): Promise<Pedido> {
  const { data, error } = await supabaseAdmin.rpc('confirmar_pagamento', {
    p_pedido_id: pedidoId,
    p_gateway_ref: gatewayRef,
  });
  if (error) throw error;
  return (data as unknown[])[0] as Pedido;
}

export async function listarPedidos(userId: string): Promise<Pedido[]> {
  return repo.listarPedidosUser(userId);
}

export async function cancelarPedido(pedidoId: string, userId: string): Promise<void> {
  const pedido = await repo.getPedido(pedidoId);
  if (!pedido) throw new HttpError(404, 'PEDIDO_NAO_ENCONTRADO', 'Pedido não encontrado');
  if (pedido.user_id !== userId) throw new HttpError(403, 'FORBIDDEN', 'Pedido não pertence ao usuário');
  if (pedido.status !== 'PENDENTE') throw new HttpError(400, 'NAO_CANCELAVEL', 'Apenas pedidos PENDENTE podem ser cancelados');
  await repo.atualizarStatus(pedidoId, 'CANCELADO');
}
