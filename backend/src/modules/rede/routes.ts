import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const redeRouter = Router();
redeRouter.get('/downline', verifyJWT, ctrl.getDownline);
redeRouter.get('/upline', verifyJWT, ctrl.getUpline);
redeRouter.get('/linhas', verifyJWT, ctrl.getLinhas);
