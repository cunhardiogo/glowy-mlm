import { Router } from 'express';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

export const adminRouter = Router();
adminRouter.use(verifyJWT, requireRole('ADMIN'));

// Usuários
adminRouter.get('/usuarios', ctrl.listarUsuarios);
adminRouter.get('/usuarios/:id', ctrl.getUsuario);
adminRouter.patch('/usuarios/:id/bloquear', ctrl.bloquearUsuario);

// Documentos
adminRouter.get('/documentos', ctrl.listarDocumentosPendentes);
adminRouter.patch('/documentos/:id/aprovar', ctrl.aprovarDocumento);
adminRouter.patch('/documentos/:id/rejeitar', ctrl.rejeitarDocumento);

// Saques
adminRouter.get('/saques', ctrl.listarSaques);
adminRouter.patch('/saques/:id/aprovar', ctrl.aprovarSaque);
adminRouter.patch('/saques/:id/pagar', ctrl.pagarSaque);
adminRouter.patch('/saques/:id/rejeitar', ctrl.rejeitarSaque);

// Credenciamentos
adminRouter.get('/credenciamentos', ctrl.listarCredenciamentos);
adminRouter.post('/credenciamentos/:id/aprovar', ctrl.aprovarCredenciamento);
adminRouter.post('/credenciamentos/:id/rejeitar', ctrl.rejeitarCredenciamento);

// Ciclos
adminRouter.get('/ciclos', ctrl.listarCiclosAdmin);
adminRouter.post('/ciclos/abrir', ctrl.abrirCicloAdmin);
adminRouter.post('/ciclos/:ref/fechar', ctrl.fecharCicloAdmin);

// Dashboard
adminRouter.get('/dashboard', ctrl.getDashboard);
