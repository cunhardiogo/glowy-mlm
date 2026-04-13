import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const bonusRouter = Router();
bonusRouter.get('/', verifyJWT, ctrl.getBonus);
bonusRouter.get('/resumo', verifyJWT, ctrl.getResumo);
