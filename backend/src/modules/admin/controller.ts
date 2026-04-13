import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import * as finService from '../financeiro/service.js';
import * as cicloService from '../ciclo/service.js';
import { cicloRefAtual } from '@glowy/shared';
import { logger } from '../../config/logger.js';

export async function listarUsuarios(req: Request, res: Response, next: NextFunction) {
  try {
    const search = (req.query.q as string) ?? '';
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('id,username,nome,email,cpf,tipo,kit_atual,graduacao_reconhecimento,ativo_ciclo_atual,status_ativo,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function getUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', req.params.id).single();
    if (error || !data) throw new HttpError(404, 'NOT_FOUND', 'Usuário não encontrado');
    res.json({ data });
  } catch (err) { next(err); }
}

export async function bloquearUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    const { ativo } = z.object({ ativo: z.boolean() }).parse(req.body);
    const { error } = await supabaseAdmin.from('users').update({ status_ativo: ativo }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function listarDocumentosPendentes(req: Request, res: Response, next: NextFunction) {
  try {
    const status = (req.query.status as string) ?? 'PENDENTE';
    const { data, error } = await supabaseAdmin
      .from('documentos')
      .select('*, users!documentos_user_id_fkey(nome, email, username)')
      .eq('status', status)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function aprovarDocumento(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { error } = await supabaseAdmin
      .from('documentos')
      .update({ status: 'APROVADO', revisor_id: req.user.id })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function rejeitarDocumento(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { observacao } = z.object({ observacao: z.string().min(1) }).parse(req.body);
    const { error } = await supabaseAdmin
      .from('documentos')
      .update({ status: 'REJEITADO', revisor_id: req.user.id, observacao })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function listarSaques(req: Request, res: Response, next: NextFunction) {
  try {
    const status = (req.query.status as string) ?? 'SOLICITADO';
    const { data, error } = await supabaseAdmin
      .from('saques')
      .select('*, users!saques_user_id_fkey(nome, email, cpf)')
      .eq('status', status)
      .order('solicitado_em', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function aprovarSaque(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    res.json({ data: await finService.aprovarSaque(req.params.id, req.user.id) });
  } catch (err) { next(err); }
}

export async function pagarSaque(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await finService.pagarSaque(req.params.id) });
  } catch (err) { next(err); }
}

export async function rejeitarSaque(req: Request, res: Response, next: NextFunction) {
  try {
    const { observacao } = z.object({ observacao: z.string().optional() }).parse(req.body);
    res.json({ data: await finService.rejeitarSaque(req.params.id, observacao ?? '') });
  } catch (err) { next(err); }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const ciclo = cicloRefAtual();
    const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard', { p_ciclo_ref: ciclo });
    if (error) throw error;
    const d = (data as unknown[])[0] as Record<string, unknown>;
    const alertas: { mensagem: string }[] = [];
    if (Number(d.docs_pendentes) > 0) alertas.push({ mensagem: `${d.docs_pendentes} documento(s) aguardando revisão` });
    if (Number(d.saques_pendentes) > 0) alertas.push({ mensagem: `${d.saques_pendentes} saque(s) aguardando aprovação` });
    res.json({ data: { ...d, alertas } });
  } catch (err) { next(err); }
}

export async function listarCredenciamentos(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_lista_credenciamentos');
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function aprovarCredenciamento(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { id } = req.params;
    await supabaseAdmin.from('documentos').update({ status: 'APROVADO', revisor_id: req.user.id }).eq('user_id', id).eq('status', 'PENDENTE');
    await supabaseAdmin.from('users').update({ status_ativo: true }).eq('id', id);
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function rejeitarCredenciamento(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { id } = req.params;
    const { motivo } = z.object({ motivo: z.string().optional() }).parse(req.body);
    await supabaseAdmin.from('documentos').update({ status: 'REJEITADO', revisor_id: req.user.id, observacao: motivo ?? null }).eq('user_id', id).eq('status', 'PENDENTE');
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function listarCiclosAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin.from('ciclos').select('*').order('ref_mes', { ascending: false }).limit(24);
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
}

export async function abrirCicloAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { ref } = z.object({ ref: z.string().regex(/^\d{4}-\d{2}-01$/, 'Formato: YYYY-MM-01') }).parse(req.body);
    await cicloService.abrirCiclo(ref);
    res.json({ data: { ok: true } });
  } catch (err) { next(err); }
}

export async function fecharCicloAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const ref = req.params.ref;
    cicloService.fecharCiclo(ref).catch((e: Error) => logger.error({ err: e, ref }, 'fecharCiclo background error'));
    res.json({ data: { ok: true, message: 'Fechamento iniciado em background' } });
  } catch (err) { next(err); }
}
