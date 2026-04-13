import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabasePublic } from '../config/db.js';
import { requestContext } from '../lib/requestContext.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

function createUserClient(token: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
import type { UserTipo } from '@glowy/shared';

export interface AuthUser {
  id: string;
  auth_id: string;
  tipo: UserTipo;
  username: string;
  path: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function verifyJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token ausente' } });
      return;
    }
    const token = header.slice('Bearer '.length).trim();
    const { data, error } = await supabasePublic.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token inválido' } });
      return;
    }
    const authId = data.user.id;
    // Buscar perfil com o JWT do próprio usuário (RLS permite acesso ao próprio registro)
    const userClient = createUserClient(token);
    const { data: row, error: rowErr } = await userClient
      .from('users')
      .select('id, auth_id, tipo, username, path')
      .eq('auth_id', authId)
      .single();
    if (rowErr || !row) {
      res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'Usuário não cadastrado' } });
      return;
    }
    req.user = {
      id: row.id as string,
      auth_id: row.auth_id as string,
      tipo: row.tipo as UserTipo,
      username: row.username as string,
      path: row.path as string,
    };
    // Propagar token via AsyncLocalStorage para repositórios/controllers
    requestContext.run({ token }, () => next());
  } catch (err) {
    logger.error({ err }, 'verifyJWT error');
    res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Falha ao autenticar' } });
  }
}
