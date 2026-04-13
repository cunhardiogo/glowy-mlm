import { supabaseAdmin } from '../../config/db.js';

export async function listarCiclos() {
  const { data, error } = await supabaseAdmin
    .from('ciclos')
    .select('*')
    .order('ref_mes', { ascending: false });
  if (error) throw error;
  return data;
}

export async function credenciamentosPendentes() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, nome, email, cpf, created_at, contrato_aceito_em, kit_atual')
    .is('kit_atual', null)
    .eq('tipo', 'EI')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function aprovarCredenciamento(userId: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ ativo_ciclo_atual: true })
    .eq('id', userId);
  if (error) throw error;
}

export async function listarGraduacoes() {
  const { data, error } = await supabaseAdmin
    .from('param_graduacoes')
    .select('*')
    .order('pg_requerido', { ascending: true });
  if (error) throw error;
  return data;
}

export async function atualizarGraduacao(nome: string, patch: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from('param_graduacoes').update(patch).eq('graduacao', nome);
  if (error) throw error;
}

export async function obterRemessa(id: string) {
  const { data, error } = await supabaseAdmin
    .from('remessas_pagamento')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getDashboardStats(cicloRef: string) {
  const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard', { p_ciclo_ref: cicloRef });
  if (error) throw error;
  return (data as unknown[])[0] as {
    eis_ativos: number;
    volume_centavos: number;
    bonus_provisionados_centavos: number;
    saques_pendentes: number;
    docs_pendentes: number;
  };
}
