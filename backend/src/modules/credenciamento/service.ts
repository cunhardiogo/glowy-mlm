import crypto from 'node:crypto';
import { supabaseAdmin } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { validarCPF, type CadastroEIInput, type CadastroClienteInput } from '@glowy/shared';
import {
  findUserByUsername,
  findUserByCpf,
  findUserByAuthId,
  insertUser,
  insertContratoAceite,
  insertDocumento,
  updateUser,
} from './repository.js';
import { logger } from '../../config/logger.js';

function gerarUsername(nome: string, cpf: string): string {
  const base = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 20);
  const sufixo = cpf.replace(/\D/g, '').slice(-4);
  return `${base}.${sufixo}`.slice(0, 40);
}

export async function registrarEI(
  input: CadastroEIInput
): Promise<{ user_id: string; auth_id: string }> {
  if (!validarCPF(input.cpf)) throw new HttpError(400, 'CPF_INVALIDO', 'CPF inválido');
  const cpfLimpo = input.cpf.replace(/\D/g, '');

  if (await findUserByCpf(cpfLimpo)) throw new HttpError(409, 'CPF_JA_CADASTRADO', 'CPF já cadastrado');

  const patrocinador = await findUserByUsername(input.patrocinador_username);
  if (!patrocinador) throw new HttpError(404, 'PATROCINADOR_NAO_ENCONTRADO', 'Patrocinador não encontrado');
  if (patrocinador.tipo !== 'EI') throw new HttpError(400, 'PATROCINADOR_INVALIDO', 'Patrocinador deve ser EI');
  if (!patrocinador.status_ativo) throw new HttpError(400, 'PATROCINADOR_INATIVO', 'Patrocinador inativo');

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
    user_metadata: { nome: input.nome },
  });
  if (authErr || !authData?.user) {
    throw new HttpError(400, 'AUTH_CREATE_FAILED', authErr?.message ?? 'Falha ao criar autenticação');
  }
  const authId = authData.user.id;

  try {
    let username = gerarUsername(input.nome, cpfLimpo);
    let tries = 0;
    while (await findUserByUsername(username)) {
      tries++;
      username = `${gerarUsername(input.nome, cpfLimpo)}.${tries}`;
      if (tries > 10) throw new HttpError(500, 'USERNAME_FAIL', 'Falha ao gerar username');
    }

    // Não setar path — o trigger fn_users_set_path faz isso automaticamente
    const user = await insertUser({
      auth_id: authId,
      tipo: 'EI',
      username,
      nome: input.nome,
      email: input.email,
      cpf: cpfLimpo,
      telefone: input.telefone,
      patrocinador_id: patrocinador.id,
    });

    return { user_id: user.id, auth_id: authId };
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(authId).catch((e) =>
      logger.warn({ e }, 'rollback auth falhou')
    );
    throw err;
  }
}

export async function registrarCliente(
  input: CadastroClienteInput
): Promise<{ user_id: string; auth_id: string }> {
  if (!validarCPF(input.cpf)) throw new HttpError(400, 'CPF_INVALIDO', 'CPF inválido');
  const cpfLimpo = input.cpf.replace(/\D/g, '');

  if (await findUserByCpf(cpfLimpo)) throw new HttpError(409, 'CPF_JA_CADASTRADO', 'CPF já cadastrado');

  let patrocinadorId: string | null = null;
  if (input.patrocinador_username) {
    const p = await findUserByUsername(input.patrocinador_username);
    if (!p) throw new HttpError(404, 'PATROCINADOR_NAO_ENCONTRADO', 'Patrocinador não encontrado');
    patrocinadorId = p.id;
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
    user_metadata: { nome: input.nome },
  });
  if (authErr || !authData?.user) {
    throw new HttpError(400, 'AUTH_CREATE_FAILED', authErr?.message ?? 'Falha ao criar autenticação');
  }
  const authId = authData.user.id;

  try {
    let username = gerarUsername(input.nome, cpfLimpo);
    let tries = 0;
    while (await findUserByUsername(username)) {
      tries++;
      username = `${gerarUsername(input.nome, cpfLimpo)}.${tries}`;
    }

    const user = await insertUser({
      auth_id: authId,
      tipo: 'CLIENTE_PREFERENCIAL',
      username,
      nome: input.nome,
      email: input.email,
      cpf: cpfLimpo,
      telefone: input.telefone ?? null,
      patrocinador_id: patrocinadorId,
    });

    return { user_id: user.id, auth_id: authId };
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(authId).catch(() => {});
    throw err;
  }
}

export async function loginPassword(
  email: string,
  senha: string
): Promise<{ access_token: string; refresh_token: string }> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password: senha });
  if (error || !data?.session) throw new HttpError(401, 'CREDENCIAIS_INVALIDAS', 'Email ou senha inválidos');
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export async function refreshSession(
  refresh_token: string
): Promise<{ access_token: string; refresh_token: string }> {
  const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
  if (error || !data?.session) throw new HttpError(401, 'REFRESH_FAIL', 'Falha ao renovar sessão');
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token };
}

export async function aceitarContrato(
  userId: string,
  versao: string,
  ip: string,
  userAgent: string
): Promise<{ hash: string }> {
  const payload = `${userId}|${versao}|${ip}|${userAgent}|${Date.now()}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  await insertContratoAceite(userId, versao, ip, userAgent, hash);
  await updateUser(userId, {
    contrato_aceito_em: new Date().toISOString(),
    contrato_ip: ip,
    contrato_user_agent: userAgent,
    contrato_hash: hash,
  });
  return { hash };
}

export async function uploadDocumento(
  userId: string,
  tipo: string,
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ path: string }> {
  const ext = filename.split('.').pop() ?? 'bin';
  const storagePath = `${userId}/${tipo}/${Date.now()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from('documentos')
    .upload(storagePath, fileBuffer, { contentType, upsert: false });
  if (error) throw new HttpError(500, 'UPLOAD_FAIL', error.message);
  await insertDocumento(userId, tipo, storagePath);
  return { path: storagePath };
}

export async function statusCredenciamento(userId: string) {
  const u = await findUserByAuthId(userId);
  if (!u) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
  return {
    contrato_aceito: !!u.contrato_aceito_em,
    kit_atual: u.kit_atual,
    tipo: u.tipo,
    graduacao: u.graduacao_reconhecimento,
  };
}
