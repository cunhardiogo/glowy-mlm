import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const graduacaoRouter = Router();
graduacaoRouter.get('/atual', verifyJWT, ctrl.getGraduacaoAtual);
graduacaoRouter.get('/historico', verifyJWT, ctrl.getHistorico);

export const pontosRouter = Router();
pontosRouter.get('/extrato', verifyJWT, ctrl.getExtrato);
