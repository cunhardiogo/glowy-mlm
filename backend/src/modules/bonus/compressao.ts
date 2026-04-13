import type { PoolClient } from 'pg';
import { GRADUACOES } from '@glowy/shared';
import type { GraduacaoNome } from '@glowy/shared';

export interface UplineNode {
  id: string;
  nivel: number;
  kit_atual: 'STANDARD' | 'PREMIUM' | null;
  graduacao_ciclo_atual: GraduacaoNome;
  graduacao_reconhecimento: GraduacaoNome;
  ativo_ciclo_atual: boolean;
  created_at: Date;
  patrocinador_id: string | null;
}

/**
 * Sobe a cadeia de patrocinadores aplicando Compressão Dinâmica:
 * inativos são pulados (não contam como nível), mas a genealogia não muda.
 * Retorna até maxNiveis ancestrais ATIVOS em ordem crescente de nível.
 */
export async function uplineComprimido(
  userId: string,
  maxNiveis: number,
  client: PoolClient
): Promise<UplineNode[]> {
  const out: UplineNode[] = [];
  let nivel = 0;

  const { rows: startRows } = await client.query<{ patrocinador_id: string | null }>(
    `SELECT patrocinador_id FROM users WHERE id = $1`,
    [userId]
  );
  let current: string | null = startRows[0]?.patrocinador_id ?? null;

  while (current && nivel < maxNiveis) {
    const { rows } = await client.query<UplineNode & { patrocinador_id: string | null }>(
      `SELECT u.id, u.kit_atual, u.graduacao_ciclo_atual, u.graduacao_reconhecimento,
              u.ativo_ciclo_atual, u.created_at, u.patrocinador_id
         FROM users u
        WHERE u.id = $1`,
      [current]
    );
    if (!rows.length) break;
    const row = rows[0];

    if (row.ativo_ciclo_atual) {
      nivel += 1;
      out.push({ ...row, nivel });
    }
    current = row.patrocinador_id;
  }

  return out;
}

/**
 * Verifica se um EI PREMIUM tem direito aos níveis extras (4-7 para PP/Upgrade, 6-10 para Produtividade).
 * Critério: qualificado em PRATA+ OU ainda dentro dos 3 primeiros meses completos.
 */
export function premiumElegivelNiveisExtras(node: UplineNode, hoje: Date): boolean {
  if (node.kit_atual !== 'PREMIUM') return false;
  if (GRADUACOES[node.graduacao_reconhecimento].nivel >= GRADUACOES.PRATA.nivel) return true;
  const criado = new Date(node.created_at);
  const mesesCompletos =
    (hoje.getFullYear() - criado.getFullYear()) * 12 + (hoje.getMonth() - criado.getMonth());
  if (mesesCompletos < 3) return true;
  if (mesesCompletos === 3 && hoje.getDate() < criado.getDate()) return true;
  return false;
}
