import { z } from 'zod';

const ItemSchema = z.object({
  sku: z.string().min(1),
  quantidade: z.number().int().positive(),
});

export const KitInicialSchema = z.object({
  kit: z.enum(['STANDARD', 'PREMIUM']),
  endereco_entrega_id: z.string().uuid().optional(),
});
export type KitInicialInput = z.infer<typeof KitInicialSchema>;

export const UpgradeSchema = z.object({
  itens: z.array(ItemSchema).min(1),
});
export type UpgradeInput = z.infer<typeof UpgradeSchema>;

export const RecompraSchema = z.object({
  itens: z.array(ItemSchema).min(1),
  endereco_entrega_id: z.string().uuid().optional(),
});
export type RecompraInput = z.infer<typeof RecompraSchema>;
