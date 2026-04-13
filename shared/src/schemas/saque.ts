import { z } from 'zod';

export const SaqueSchema = z.object({
  valor_centavos: z.number().int().min(1000, 'Mínimo R$ 10'),
  pix_chave: z.string().min(3),
  pix_tipo: z.enum(['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']),
});
export type SaqueInput = z.infer<typeof SaqueSchema>;
