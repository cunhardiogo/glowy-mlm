import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { webhookLimiter } from '../../middleware/rateLimit.js';

export const pedidosRouter = Router();
pedidosRouter.get('/', verifyJWT, ctrl.listarPedidos);
pedidosRouter.post('/kit-inicial', verifyJWT, ctrl.criarKitInicial);
pedidosRouter.post('/upgrade', verifyJWT, ctrl.criarUpgrade);
pedidosRouter.post('/recompra', verifyJWT, ctrl.criarRecompra);
pedidosRouter.post('/webhook/pix', webhookLimiter, ctrl.webhookPix);
pedidosRouter.delete('/:id', verifyJWT, ctrl.cancelarPedido);
