import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

export const cicloRouter = Router();
cicloRouter.get('/', verifyJWT, ctrl.listarCiclos);
cicloRouter.get('/atual', verifyJWT, ctrl.getCicloAtual);
cicloRouter.post('/', verifyJWT, requireRole('ADMIN'), ctrl.criarCiclo);
cicloRouter.post('/:refMes/fechar', verifyJWT, requireRole('ADMIN'), ctrl.fecharCicloCtrl);
