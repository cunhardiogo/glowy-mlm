import { AsyncLocalStorage } from 'node:async_hooks';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

interface RequestContext { token: string }

export const requestContext = new AsyncLocalStorage<RequestContext>();

function supabaseForRequest(): SupabaseClient {
  const ctx = requestContext.getStore();
  const token = ctx?.token;
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    token
      ? { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } }
      : { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Proxy que age como SupabaseClient mas sempre usa o cliente do request atual.
 * Substitui supabaseAdmin nos módulos — sem precisar alterar as chamadas existentes.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    return (supabaseForRequest() as any)[prop];
  },
});
