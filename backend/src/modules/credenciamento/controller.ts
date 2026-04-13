import type { Request, Response, NextFunction } from 'express';
import {
  CadastroEISchema,
  CadastroClienteSchema,
  AceiteContratoSchema,
} from '@glowy/shared';
import * as service from './service.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function postRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const tipo = req.body?.tipo ?? 'EI';
    if (tipo === 'EI') {
      const input = CadastroEISchema.parse(req.body);
      const r = await service.registrarEI(input);
      res.status(201).json({ data: r });
    } else {
      const input = CadastroClienteSchema.parse(req.body);
      const r = await service.registrarCliente(input);
      res.status(201).json({ data: r });
    }
  } catch (err) {
    next(err);
  }
}

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, senha } = req.body ?? {};
    if (!email || !senha) throw new HttpError(400, 'PARAMS', 'email e senha obrigatórios');
    const out = await service.loginPassword(email, senha);
    res.json({ data: out });
  } catch (err) {
    next(err);
  }
}

export async function postRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refresh_token } = req.body ?? {};
    if (!refresh_token) throw new HttpError(400, 'PARAMS', 'refresh_token obrigatório');
    const out = await service.refreshSession(refresh_token);
    res.json({ data: out });
  } catch (err) {
    next(err);
  }
}

export async function postAceitarContrato(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const input = AceiteContratoSchema.parse(req.body);
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? '';
    const ua = (req.headers['user-agent'] as string) ?? '';
    const out = await service.aceitarContrato(req.user.id, input.versao_contrato, ip, ua);
    res.json({ data: out });
  } catch (err) {
    next(err);
  }
}

export async function postDocumento(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    const tipo = (req.body?.tipo as string) ?? 'GENERICO';
    if (!file) throw new HttpError(400, 'NO_FILE', 'Arquivo não enviado');
    const out = await service.uploadDocumento(
      req.user.id,
      tipo,
      file.buffer,
      file.originalname,
      file.mimetype
    );
    res.status(201).json({ data: out });
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const out = await service.statusCredenciamento(req.user.auth_id);
    res.json({ data: out });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentos(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTH', 'Não autenticado');
    const { supabaseAdmin } = await import('../../config/db.js');
    const { data, error } = await supabaseAdmin.rpc('get_documentos_user', { p_user_id: req.user.id });
    if (error) throw error;
    res.json({ data: data ?? [] });
  } catch (err) {
    next(err);
  }
}
