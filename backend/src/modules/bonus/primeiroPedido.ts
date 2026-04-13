import type { PoolClient } from 'pg';
import {
  PERCENT_PRIMEIRO_PEDIDO,
  NIVEL_MAX_PRIMEIRO_PEDIDO,
  KIT_VALOR_CENTAVOS,
} from '@glowy/shared';
import { uplineComprimido, premiumElegivelNiveisExtras } from './compressao.js';

export async function calcularBonusPrimeiroPedido(
  pedidoId: string,
  client: PoolClient
): Promise<void> {
  const { rows: pedRows } = await client.query<{
    id: string;
    user_id: string;
    kit: 'STANDARD' | 'PREMIUM';
    valor_centavos: number;
    ciclo_ref: string;
  }>(
    `SELECT id, user_id, kit, valor_centavos, ciclo_ref FROM pedidos WHERE id = $1`,
    [pedidoId]
  );
  if (!pedRows.length) return;
  const pedido = pedRows[0];
  if (!pedido.kit) return;

  // Base de cálculo = valor de referência do kit (não o valor real do pedido)
  const base = KIT_VALOR_CENTAVOS[pedido.kit];
  const hoje = new Date();
  const maxNiveis = NIVEL_MAX_PRIMEIRO_PEDIDO.PREMIUM; // busca até 7 sempre; filtramos abaixo

  const upline = await uplineComprimido(pedido.user_id, maxNiveis, client);

  for (const u of upline) {
    const maxDoPat = u.kit_atual === 'PREMIUM' ? NIVEL_MAX_PRIMEIRO_PEDIDO.PREMIUM : NIVEL_MAX_PRIMEIRO_PEDIDO.STANDARD;
    if (u.nivel > maxDoPat) break;
    // Níveis 4-7 exigem PREMIUM elegível
    if (u.nivel > NIVEL_MAX_PRIMEIRO_PEDIDO.STANDARD && !premiumElegivelNiveisExtras(u, hoje)) continue;

    const pct = PERCENT_PRIMEIRO_PEDIDO[u.nivel] ?? 0;
    if (pct <= 0) continue;
    const valor = Math.floor((base * pct) / 100);
    if (valor <= 0) continue;

    await client.query(
      `INSERT INTO bonus_lancamentos
         (ciclo_ref, beneficiario_id, origem_user_id, pedido_id, tipo, nivel, percentual, base_centavos, valor_centavos, status)
       VALUES ($1::date, $2, $3, $4, 'PRIMEIRO_PEDIDO', $5, $6, $7, $8, 'PROVISIONADO')
       ON CONFLICT DO NOTHING`,
      [pedido.ciclo_ref, u.id, pedido.user_id, pedido.id, u.nivel, pct, base, valor]
    );
  }
}
