import { supabaseAdmin } from '../../lib/requestContext.js';
import type { User } from '@glowy/shared';

export async function findUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return (data as User) ?? null;
}

export async function findUserByCpf(cpf: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('cpf', cpf)
    .maybeSingle();
  if (error) throw error;
  return (data as User) ?? null;
}

export async function findUserByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();
  if (error) throw error;
  return (data as User) ?? null;
}

export async function insertUser(row: Partial<User>): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
  const { error } = await supabaseAdmin.from('users').update(patch).eq('id', id);
  if (error) throw error;
}

export async function insertContratoAceite(
  userId: string,
  versao: string,
  ip: string,
  ua: string,
  hash: string
): Promise<void> {
  const { error } = await supabaseAdmin.from('users').update({
    contrato_aceito_em: new Date().toISOString(),
    contrato_ip: ip,
    contrato_user_agent: ua,
    contrato_hash: hash,
  }).eq('id', userId);
  if (error) throw error;
}

export async function insertDocumento(
  userId: string,
  tipo: string,
  storagePath: string,
  mime?: string
): Promise<void> {
  const { error } = await supabaseAdmin.from('documentos').insert({
    user_id: userId,
    tipo,
    storage_path: storagePath,
    mime: mime ?? null,
    status: 'PENDENTE',
  });
  if (error) throw error;
}
