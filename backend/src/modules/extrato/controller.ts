import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getPontos(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const ciclo = (req.query.ciclo as string) || null;
    const { data, error } = await supabaseAdmin.rpc('get_pontos_extrato', {
      p_user_id: req.user.id,
      p_ciclo_ref: ciclo ?? null,
    });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getFinanceiro(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const ciclo = (req.query.ciclo as string) || null;
    const { data, error } = await supabaseAdmin.rpc('get_financeiro_extrato', {
      p_user_id: req.user.id,
      p_ciclo_ref: ciclo ?? null,
    });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}
