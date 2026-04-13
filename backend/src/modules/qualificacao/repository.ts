import { supabaseAdmin } from '../../config/db.js';

export async function qualificacaoDoCiclo(userId: string, cicloRef: string) {
  const { data, error } = await supabaseAdmin
    .from('qualificacoes')
    .select('*')
    .eq('user_id', userId)
    .eq('ciclo_ref', cicloRef)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function historicoQualificacoes(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('qualificacoes')
    .select('*')
    .eq('user_id', userId)
    .order('ciclo_ref', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function extratoPontos(userId: string, cicloRef?: string) {
  const { data, error } = await supabaseAdmin.rpc('get_pontos_extrato', {
    p_user_id: userId,
    p_ciclo_ref: cicloRef ?? null,
  });
  if (error) throw error;
  return data ?? [];
}
