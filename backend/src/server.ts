import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { credenciamentoRouter } from './modules/credenciamento/routes.js';
import { pedidosRouter } from './modules/pedidos/routes.js';
import { financeiroRouter } from './modules/financeiro/routes.js';
import { bonusRouter } from './modules/bonus/routes.js';
import { redeRouter } from './modules/rede/routes.js';
import { cicloRouter } from './modules/ciclo/routes.js';
import { graduacaoRouter } from './modules/qualificacao/routes.js';
import { adminRouter } from './modules/admin/routes.js';
import { extratoRouter } from './modules/extrato/routes.js';
import { perfilRouter } from './modules/perfil/routes.js';
import { iniciarJobFechamentoCiclo } from './jobs/fechamentoCiclo.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

const api = express.Router();
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/v1', api);

api.use('/credenciamento', credenciamentoRouter);
api.use('/pedidos', pedidosRouter);
api.use('/financeiro', financeiroRouter);
api.use('/bonus', bonusRouter);
api.use('/rede', redeRouter);
api.use('/ciclos', cicloRouter);
api.use('/admin', adminRouter);
api.use('/extrato', extratoRouter);
api.use('/qualificacao', graduacaoRouter);
api.use('/perfil', perfilRouter);

app.use(errorHandler);

const PORT = env.PORT ?? 3001;
app.listen(PORT, () => {
  logger.info({ PORT }, 'Backend Glowy CRM iniciado');
  if (env.NODE_ENV === 'production') {
    iniciarJobFechamentoCiclo();
  }
});

export default app;
