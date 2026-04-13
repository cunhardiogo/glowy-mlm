import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const extratoRouter = Router();
extratoRouter.get('/pontos', verifyJWT, ctrl.getPontos);
extratoRouter.get('/financeiro', verifyJWT, ctrl.getFinanceiro);
