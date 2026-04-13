import { supabaseAdmin } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import type { SaqueInput } from '@glowy/shared';

export async function getCarteira(userId: string) {
  const { data: c } = await supabaseAdmin
    .from('carteira')
    .select('saldo_liberado_centavos,saldo_provisionado_centavos,total_recebido_centavos')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: saques } = await supabaseAdmin
    .from('saques')
    .select('valor_centavos')
    .eq('user_id', userId)
    .in('status', ['APROVADO', 'PAGO']);

  const sacado = (saques ?? []).reduce((s, r) => s + Number(r.valor_centavos), 0);
  const liberado = Number(c?.saldo_liberado_centavos ?? 0);

  return {
    saldo_liberado_centavos: liberado,
    saldo_provisionado_centavos: Number(c?.saldo_provisionado_centavos ?? 0),
    total_recebido_centavos: Number(c?.total_recebido_centavos ?? 0),
    saldo_disponivel_centavos: Math.max(0, liberado - sacado),
    total_sacado_centavos: sacado,
  };
}

export async function solicitarSaque(userId: string, input: SaqueInput) {
  const carteira = await getCarteira(userId);
  if (input.valor_centavos > carteira.saldo_disponivel_centavos) {
    throw new HttpError(400, 'SALDO_INSUFICIENTE', 'Saldo insuficiente');
  }
  if (input.valor_centavos < 1000) {
    throw new HttpError(400, 'VALOR_MINIMO', 'Valor mínimo de R$ 10,00');
  }
  const { data, error } = await supabaseAdmin
    .from('saques')
    .insert({
      user_id: userId,
      valor_centavos: input.valor_centavos,
      taxa_centavos: 0,
      pix_chave: input.pix_chave,
      pix_tipo: input.pix_tipo,
      status: 'SOLICITADO',
      solicitado_em: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listarSaques(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('saques')
    .select('*')
    .eq('user_id', userId)
    .order('solicitado_em', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function aprovarSaque(saqueId: string, _adminId: string) {
  const { data, error } = await supabaseAdmin
    .from('saques')
    .update({ status: 'APROVADO', processado_em: new Date().toISOString() })
    .eq('id', saqueId)
    .eq('status', 'SOLICITADO')
    .select()
    .single();
  if (error || !data) throw new HttpError(404, 'SAQUE_NAO_ENCONTRADO', 'Saque não encontrado ou já processado');
  return data;
}

export async function pagarSaque(saqueId: string) {
  const { data, error } = await supabaseAdmin
    .from('saques')
    .update({ status: 'PAGO', processado_em: new Date().toISOString() })
    .eq('id', saqueId)
    .eq('status', 'APROVADO')
    .select()
    .single();
  if (error || !data) throw new HttpError(404, 'SAQUE_NAO_ENCONTRADO', 'Saque não encontrado ou não aprovado');

  // Debitar da carteira
  const { data: carteira } = await supabaseAdmin
    .from('carteira')
    .select('saldo_liberado_centavos')
    .eq('user_id', data.user_id)
    .maybeSingle();
  const saldoAtual = Number(carteira?.saldo_liberado_centavos ?? 0);
  await supabaseAdmin
    .from('carteira')
    .upsert({
      user_id: data.user_id,
      saldo_liberado_centavos: Math.max(0, saldoAtual - Number(data.valor_centavos)),
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  return data;
}

export async function rejeitarSaque(saqueId: string, observacao: string) {
  const { data, error } = await supabaseAdmin
    .from('saques')
    .update({ status: 'REJEITADO', processado_em: new Date().toISOString(), observacao })
    .eq('id', saqueId)
    .eq('status', 'SOLICITADO')
    .select()
    .single();
  if (error || !data) throw new HttpError(404, 'SAQUE_NAO_ENCONTRADO', 'Saque não encontrado');
  return data;
}
