import type { Request, Response, NextFunction } from 'express';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getGraduacaoAtual(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.graduacaoAtual(req.user.id) });
  } catch (err) {
    next(err);
  }
}

export async function getHistorico(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.historico(req.user.id) });
  } catch (err) {
    next(err);
  }
}

export async function getExtrato(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const ciclo = req.query.ciclo as string | undefined;
    res.json({ data: await service.extrato(req.user.id, ciclo) });
  } catch (err) {
    next(err);
  }
}
