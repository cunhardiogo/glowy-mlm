import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listarPedidos(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await service.listarPedidos(req.user.id) });
  } catch (err) { next(err); }
}

export async function criarKitInicial(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { kit } = z.object({ kit: z.enum(['STANDARD', 'PREMIUM']) }).parse(req.body);
    const result = await service.criarKitInicial(req.user.id, kit);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function criarUpgrade(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.status(201).json({ data: await service.criarUpgrade(req.user.id) });
  } catch (err) { next(err); }
}

export async function criarRecompra(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { valor_centavos } = z.object({ valor_centavos: z.number().int().min(3600) }).parse(req.body);
    res.status(201).json({ data: await service.criarRecompra(req.user.id, valor_centavos) });
  } catch (err) { next(err); }
}

export async function webhookPix(req: Request, res: Response, next: NextFunction) {
  try {
    const { pedido_id, gateway_ref, status } = req.body as { pedido_id: string; gateway_ref: string; status: string };
    if (status === 'PAGO') {
      await service.confirmarPagamento(pedido_id, gateway_ref);
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function cancelarPedido(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    await service.cancelarPedido(req.params.id, req.user.id);
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}
