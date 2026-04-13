import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/db.js';
import { fecharCiclo, abrirCiclo } from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function listarCiclos(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ciclos')
      .select('*')
      .order('ref_mes', { ascending: false })
      .limit(24);
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getCicloAtual(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const d = new Date();
    const refMes = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;

    const [{ data: ciclo }, { data: qual }] = await Promise.all([
      supabaseAdmin.from('ciclos').select('*').eq('ref_mes', refMes).maybeSingle(),
      supabaseAdmin.from('qualificacoes').select('*').eq('user_id', req.user.id).eq('ciclo_ref', refMes).maybeSingle(),
    ]);

    res.json({ data: { ciclo: ciclo ?? null, qualificacao: qual ?? null } });
  } catch (err) { next(err); }
}

export async function criarCiclo(req: Request, res: Response, next: NextFunction) {
  try {
    const { ref_mes } = req.body as { ref_mes: string };
    await abrirCiclo(ref_mes);
    res.status(201).json({ data: { ref_mes } });
  } catch (err) { next(err); }
}

export async function fecharCicloCtrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { refMes } = req.params;
    await fecharCiclo(refMes);
    res.json({ data: { ok: true, refMes } });
  } catch (err) { next(err); }
}
