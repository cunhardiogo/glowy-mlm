import { supabaseAdmin } from '../../config/db.js';
import { cicloRefAtual } from '@glowy/shared';

export interface RedeNode {
  id: string;
  username: string;
  nome: string;
  tipo: string;
  kit_atual: string;
  graduacao_reconhecimento: string;
  path: string;
  nivel_relativo: number;
}

export async function buscarDownline(userPath: string, limit = 500): Promise<RedeNode[]> {
  const { data, error } = await supabaseAdmin.rpc('get_rede_downline', {
    p_path: userPath,
    p_max_depth: 10,
  });
  if (error) throw error;
  return ((data as RedeNode[]) ?? []).slice(0, limit);
}

export async function buscarUpline(userPath: string): Promise<RedeNode[]> {
  const { data, error } = await supabaseAdmin.rpc('get_rede_upline', { p_path: userPath });
  if (error) throw error;
  return (data as RedeNode[]) ?? [];
}

export async function linhasDiretas(userId: string, cicloRef: string) {
  const { data, error } = await supabaseAdmin.rpc('get_rede_linhas', {
    p_user_id: userId,
    p_ciclo_ref: cicloRef,
  });
  if (error) throw error;
  return data ?? [];
}
