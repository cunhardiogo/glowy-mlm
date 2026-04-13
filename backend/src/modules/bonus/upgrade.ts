import type { PoolClient } from 'pg';
import {
  PERCENT_UPGRADE,
  NIVEL_MAX_PRIMEIRO_PEDIDO,
} from '@glowy/shared';
import { uplineComprimido, premiumElegivelNiveisExtras } from './compressao.js';

export async function calcularBonusUpgrade(
  pedidoId: string,
  client: PoolClient
): Promise<void> {
  const { rows: pedRows } = await client.query<{
    id: string;
    user_id: string;
    valor_centavos: number;
    ciclo_ref: string;
  }>(
    `SELECT id, user_id, valor_centavos, ciclo_ref FROM pedidos WHERE id = $1`,
    [pedidoId]
  );
  if (!pedRows.length) return;
  const pedido = pedRows[0];

  // Base = valor real do pedido de upgrade
  const base = pedido.valor_centavos;
  const hoje = new Date();

  // Upgrade sempre usa limite PREMIUM (7 níveis), igual ao PP
  const upline = await uplineComprimido(pedido.user_id, NIVEL_MAX_PRIMEIRO_PEDIDO.PREMIUM, client);

  for (const u of upline) {
    const maxDoPat = u.kit_atual === 'PREMIUM' ? NIVEL_MAX_PRIMEIRO_PEDIDO.PREMIUM : NIVEL_MAX_PRIMEIRO_PEDIDO.STANDARD;
    if (u.nivel > maxDoPat) break;
    if (u.nivel > NIVEL_MAX_PRIMEIRO_PEDIDO.STANDARD && !premiumElegivelNiveisExtras(u, hoje)) continue;

    const pct = PERCENT_UPGRADE[u.nivel] ?? 0;
    if (pct <= 0) continue;
    const valor = Math.floor((base * pct) / 100);
    if (valor <= 0) continue;

    await client.query(
      `INSERT INTO bonus_lancamentos
         (ciclo_ref, beneficiario_id, origem_user_id, pedido_id, tipo, nivel, percentual, base_centavos, valor_centavos, status)
       VALUES ($1::date, $2, $3, $4, 'UPGRADE', $5, $6, $7, $8, 'PROVISIONADO')
       ON CONFLICT DO NOTHING`,
      [pedido.ciclo_ref, u.id, pedido.user_id, pedido.id, u.nivel, pct, base, valor]
    );
  }
}
