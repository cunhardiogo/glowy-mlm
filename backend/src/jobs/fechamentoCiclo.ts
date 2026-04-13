import cron from 'node-cron';
import { fecharCiclo, abrirCiclo } from '../modules/ciclo/service.js';
import { logger } from '../config/logger.js';

function refMesAtual(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function refMesAnterior(): string {
  const d = new Date();
  const prev = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1));
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function iniciarJobFechamentoCiclo(): void {
  // Roda dia 1 de cada mês às 03:00 UTC
  cron.schedule('0 3 1 * *', async () => {
    const anterior = refMesAnterior();
    const atual = refMesAtual();
    logger.info({ anterior, atual }, 'Job fechamento ciclo: iniciando');
    try {
      await fecharCiclo(anterior);
      await abrirCiclo(atual);
      logger.info({ anterior, atual }, 'Job fechamento ciclo: concluído');
    } catch (err) {
      logger.error({ err, anterior }, 'Job fechamento ciclo: ERRO');
    }
  }, { timezone: 'America/Sao_Paulo' });

  logger.info('Job fechamento de ciclo agendado para dia 1 às 03:00 America/Sao_Paulo');
}
