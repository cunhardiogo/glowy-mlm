import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const financeiroRouter = Router();
financeiroRouter.get('/carteira', verifyJWT, ctrl.getCarteira);
financeiroRouter.post('/saques', verifyJWT, ctrl.postSaque);
financeiroRouter.get('/saques', verifyJWT, ctrl.getSaques);
