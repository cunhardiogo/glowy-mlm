import type { Request, Response, NextFunction } from 'express';
import { SaqueSchema } from '@glowy/shared';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getCarteira(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.getCarteira(req.user.id) });
  } catch (err) {
    next(err);
  }
}

export async function postSaque(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const input = SaqueSchema.parse(req.body);
    res.status(201).json({ data: await service.solicitarSaque(req.user.id, input) });
  } catch (err) {
    next(err);
  }
}

export async function getSaques(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.listarSaques(req.user.id) });
  } catch (err) {
    next(err);
  }
}
