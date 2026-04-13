import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/requestContext.js';
import { HttpError } from '../../middleware/errorHandler.js';

const UpdatePerfilSchema = z.object({
  telefone: z.string().min(10).max(20).optional(),
  pix_chave: z.string().min(3).optional(),
  pix_tipo: z.enum(['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']).optional(),
}).strict();

export async function getPerfil(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, nome, email, cpf, telefone, tipo, kit_atual, graduacao_reconhecimento, graduacao_ciclo_atual, ativo_ciclo_atual, pix_chave, pix_tipo, contrato_aceito_em, created_at')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function updatePerfil(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const patch = UpdatePerfilSchema.parse(req.body);
    const { error } = await supabaseAdmin.from('users').update(patch).eq('id', req.user.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}
