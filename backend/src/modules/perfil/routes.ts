import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';

export const perfilRouter = Router();
perfilRouter.get('/', verifyJWT, ctrl.getPerfil);
perfilRouter.patch('/', verifyJWT, ctrl.updatePerfil);
