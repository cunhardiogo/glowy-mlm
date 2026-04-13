import { pool } from '../../config/db.js';
import * as repo from './repository.js';
import { qualificarCiclo } from './engine.js';

function cicloAtualRef(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export async function graduacaoAtual(userId: string) {
  const { supabaseAdmin } = await import('../../config/db.js');
  const ciclo = cicloAtualRef();
  const { data, error } = await supabaseAdmin.rpc('get_graduacao_atual', { p_user_id: userId, p_ciclo_ref: ciclo });
  if (error) throw error;
  return ((data as unknown[]) ?? [])[0] ?? null;
}

export async function historico(userId: string) {
  return repo.historicoQualificacoes(userId);
}

export async function extrato(userId: string, cicloRef?: string) {
  return repo.extratoPontos(userId, cicloRef);
}

export async function rodarQualificacao(cicloRef: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await qualificarCiclo(cicloRef, client);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
