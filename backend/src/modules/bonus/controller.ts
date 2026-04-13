import type { Request, Response, NextFunction } from 'express';
import * as repo from './repository.js';
import { HttpError } from '../../middleware/errorHandler.js';

function cicloAtualRef(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export async function getBonus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const ciclo = req.query.ciclo as string | undefined;
    res.json({ data: await repo.listarBonus(req.user.id, ciclo) });
  } catch (err) {
    next(err);
  }
}

export async function getResumo(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const ciclo = (req.query.ciclo as string) ?? cicloAtualRef();
    res.json({ data: await repo.resumoBonus(req.user.id, ciclo) });
  } catch (err) {
    next(err);
  }
}
