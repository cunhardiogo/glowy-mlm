import { supabaseAdmin } from '../../config/db.js';
import { cicloRefAtual } from '@glowy/shared';

export async function getDownline(userPath: string, depth = 5) {
  const maxDepth = Math.min(depth, 10);
  const { data, error } = await supabaseAdmin.rpc('get_rede_downline', {
    p_path: userPath,
    p_max_depth: maxDepth,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getLinhas(userId: string) {
  const ciclo = cicloRefAtual();
  const { data, error } = await supabaseAdmin.rpc('get_rede_linhas', {
    p_user_id: userId,
    p_ciclo_ref: ciclo,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getUpline(userPath: string) {
  const { data, error } = await supabaseAdmin.rpc('get_rede_upline', { p_path: userPath });
  if (error) throw error;
  return data ?? [];
}
