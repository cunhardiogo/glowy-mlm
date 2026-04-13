import type { Request, Response, NextFunction } from 'express';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function getDownline(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const depth = parseInt((req.query.depth as string) ?? '5', 10);
    const nodes = await service.getDownline(req.user.path, depth);
    res.json({ data: { nodes, total: nodes.length } });
  } catch (err) { next(err); }
}

export async function getLinhas(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.getLinhas(req.user.id) });
  } catch (err) { next(err); }
}

export async function getUpline(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.getUpline(req.user.path) });
  } catch (err) { next(err); }
}
