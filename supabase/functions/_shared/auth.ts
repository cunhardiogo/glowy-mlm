import { adminClient } from './supabase.ts';
import { HttpError } from './errors.ts';

export interface AuthUser {
  id: string;
  auth_id: string;
  email: string;
  tipo: 'EI' | 'ADMIN';
  nome: string;
  username: string;
  status_ativo: boolean;
  kit_atual: string | null;
  graduacao_ciclo_atual: string;
  graduacao_reconhecimento: string;
  path: string | null;
  cpf: string | null;
  telefone: string | null;
  pix_tipo: string | null;
  pix_chave: string | null;
}

export async function getAuthedUser(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new HttpError(401, 'UNAUTH', 'Token não fornecido');

  const token = authHeader.slice(7);
  const supabase = adminClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new HttpError(401, 'UNAUTH', 'Token inválido');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (profileError || !profile) throw new HttpError(401, 'UNAUTH', 'Perfil não encontrado');

  return profile as AuthUser;
}
