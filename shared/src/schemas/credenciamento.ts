import { z } from 'zod';
import { validarCPF } from '../utils/cpf.js';

const cpfSchema = z
  .string()
  .min(11)
  .refine((v) => validarCPF(v), { message: 'CPF inválido' });

export const CadastroEISchema = z.object({
  nome: z.string().min(3).max(120),
  email: z.string().email(),
  cpf: cpfSchema,
  telefone: z.string().min(10).max(20),
  senha: z.string().min(8).max(72),
  patrocinador_username: z.string().min(3).max(60),
  kit: z.enum(['STANDARD', 'PREMIUM']),
});
export type CadastroEIInput = z.infer<typeof CadastroEISchema>;

export const CadastroClienteSchema = z.object({
  nome: z.string().min(3).max(120),
  email: z.string().email(),
  cpf: cpfSchema,
  telefone: z.string().min(10).max(20).optional(),
  senha: z.string().min(8).max(72),
  patrocinador_username: z.string().min(3).max(60).optional(),
});
export type CadastroClienteInput = z.infer<typeof CadastroClienteSchema>;

export const AceiteContratoSchema = z.object({
  versao_contrato: z.string().min(1),
  aceite: z.literal(true),
});
export type AceiteContratoInput = z.infer<typeof AceiteContratoSchema>;
