import { Router } from 'express';
import multer from 'multer';
import * as ctrl from './controller.js';
import { verifyJWT } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const authRouter = Router();
authRouter.post('/register', authLimiter, ctrl.postRegister);
authRouter.post('/login', authLimiter, ctrl.postLogin);
authRouter.post('/refresh', authLimiter, ctrl.postRefresh);

export const credenciamentoRouter = Router();
credenciamentoRouter.post('/aceitar-contrato', verifyJWT, ctrl.postAceitarContrato);
credenciamentoRouter.post('/documentos', verifyJWT, upload.single('arquivo'), ctrl.postDocumento);
credenciamentoRouter.get('/documentos', verifyJWT, ctrl.getDocumentos);
credenciamentoRouter.get('/status', verifyJWT, ctrl.getStatus);
