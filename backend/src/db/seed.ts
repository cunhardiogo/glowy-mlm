/**
 * Seed de dados para desenvolvimento — Glowy Life MLM
 * Cria: 1 admin, 1 root EI (master), 6 EI na rede, 2 CP, pedidos, carteiras
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DB_HOST = process.env.DB_HOST!;
const DB_PASSWORD = process.env.DB_PASSWORD!;
const CICLO_REF = '2026-04-01'; // ciclo aberto atual

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pool = new pg.Pool({
  host: DB_HOST,
  port: 5432,
  user: 'postgres',
  password: DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function query(sql: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function createAuthUser(email: string, password: string, nome: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error) throw new Error(`Auth create failed for ${email}: ${error.message}`);
  return data.user!.id;
}

async function insertUser(params: {
  auth_id: string;
  tipo: string;
  username: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  patrocinador_id?: string;
  kit_atual?: string;
  graduacao_reconhecimento?: string;
  ativo_ciclo_atual?: boolean;
}) {
  const { rows } = await query(
    `INSERT INTO users
       (auth_id, tipo, username, nome, email, cpf, telefone, patrocinador_id,
        kit_atual, graduacao_reconhecimento, ativo_ciclo_atual, status_ativo,
        contrato_aceito_em)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,now())
     RETURNING id`,
    [
      params.auth_id,
      params.tipo,
      params.username,
      params.nome,
      params.email,
      params.cpf,
      params.telefone ?? null,
      params.patrocinador_id ?? null,
      params.kit_atual ?? null,
      params.graduacao_reconhecimento ?? 'NENHUMA',
      params.ativo_ciclo_atual ?? false,
    ]
  );
  return rows[0].id as string;
}

async function criarPedidoKitInicial(userId: string, kit: 'STANDARD' | 'PREMIUM') {
  const valor = kit === 'PREMIUM' ? 72000 : 36000;
  const pg = kit === 'PREMIUM' ? 720 : 360;
  const { rows } = await query(
    `INSERT INTO pedidos (user_id, tipo, kit, valor_centavos, pontos_graduacao, pontos_bonificaveis, status, pago_em, ciclo_ref)
     VALUES ($1,'KIT_INICIAL',$2,$3,$4,$5,'PAGO',now(),$6)
     RETURNING id`,
    [userId, kit, valor, pg, pg, CICLO_REF]
  );
  await query(
    `INSERT INTO pontos_movimento (user_id, pedido_id, ciclo_ref, pg, pb, origem)
     VALUES ($1,$2,$3,$4,$5,'KIT_INICIAL')`,
    [userId, rows[0].id, CICLO_REF, pg, 0]
  );
  await query(
    `UPDATE users SET kit_atual = $2, ativo_ciclo_atual = true WHERE id = $1`,
    [userId, kit]
  );
  return rows[0].id;
}

async function criarRecompra(userId: string, valorCentavos: number) {
  const pb = Math.floor(valorCentavos / 300); // R$3 = 1 PB
  const { rows } = await query(
    `INSERT INTO pedidos (user_id, tipo, kit, valor_centavos, pontos_graduacao, pontos_bonificaveis, status, pago_em, ciclo_ref)
     VALUES ($1,'RECOMPRA',null,$2,0,$3,'PAGO',now(),$4)
     RETURNING id`,
    [userId, valorCentavos, pb, CICLO_REF]
  );
  await query(
    `INSERT INTO pontos_movimento (user_id, pedido_id, ciclo_ref, pg, pb, origem)
     VALUES ($1,$2,$3,0,$4,'RECOMPRA')`,
    [userId, rows[0].id, CICLO_REF, pb]
  );
  return rows[0].id;
}

async function criarCarteira(userId: string, saldoLiberado: number, saldoProv: number) {
  await query(
    `INSERT INTO carteira (user_id, saldo_liberado_centavos, saldo_provisionado_centavos, total_recebido_centavos)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE
       SET saldo_liberado_centavos = $2, saldo_provisionado_centavos = $3, total_recebido_centavos = $4`,
    [userId, saldoLiberado, saldoProv, saldoLiberado + saldoProv]
  );
}

async function deleteExisting() {
  console.log('Limpando dados existentes...');
  await query(`DELETE FROM bonus_lancamentos`);
  await query(`DELETE FROM pontos_movimento`);
  await query(`DELETE FROM pedidos`);
  await query(`DELETE FROM saques`);
  await query(`DELETE FROM carteira`);
  await query(`DELETE FROM documentos`);
  await query(`DELETE FROM qualificacoes`);
  await query(`DELETE FROM users`);

  // Limpar auth users
  const { data } = await admin.auth.admin.listUsers({ perPage: 100 });
  for (const u of data?.users ?? []) {
    await admin.auth.admin.deleteUser(u.id);
  }
  console.log('Limpeza concluída.');
}

async function main() {
  console.log('=== Seed Glowy Life MLM ===\n');

  await deleteExisting();

  // 1. ADMIN
  console.log('Criando admin...');
  const adminAuthId = await createAuthUser('admin@glowy.com', 'Admin@123', 'Admin Glowy');
  const adminId = await insertUser({
    auth_id: adminAuthId,
    tipo: 'ADMIN',
    username: 'admin.glowy',
    nome: 'Admin Glowy',
    email: 'admin@glowy.com',
    cpf: '00000000001',
  });
  console.log(`  admin: ${adminId}`);

  // 2. ROOT EI (master / sem patrocinador)
  console.log('Criando master EI...');
  const masterAuthId = await createAuthUser('master@glowy.com', 'Master@123', 'Ricardo Master');
  const masterId = await insertUser({
    auth_id: masterAuthId,
    tipo: 'EI',
    username: 'ricardo.master',
    nome: 'Ricardo Master',
    email: 'master@glowy.com',
    cpf: '12345678901',
    telefone: '11999990001',
    kit_atual: 'PREMIUM',
    graduacao_reconhecimento: 'DIAMANTE',
    ativo_ciclo_atual: true,
  });
  await criarPedidoKitInicial(masterId, 'PREMIUM');
  await criarRecompra(masterId, 150000); // R$1.500
  await criarCarteira(masterId, 85000, 32000);
  console.log(`  master: ${masterId}`);

  // 3. EI nível 1 (diretos do master)
  const nivel1: string[] = [];
  const nivel1Data = [
    { nome: 'Ana Lima', email: 'ana.lima@email.com', cpf: '11122233301', kit: 'PREMIUM' as const, recompra: 90000 },
    { nome: 'Bruno Silva', email: 'bruno.silva@email.com', cpf: '11122233302', kit: 'STANDARD' as const, recompra: 45000 },
    { nome: 'Carla Souza', email: 'carla.souza@email.com', cpf: '11122233303', kit: 'PREMIUM' as const, recompra: 120000 },
    { nome: 'Diego Matos', email: 'diego.matos@email.com', cpf: '11122233304', kit: 'STANDARD' as const, recompra: 30000 },
  ];

  console.log('Criando EI nível 1...');
  for (const d of nivel1Data) {
    const authId = await createAuthUser(d.email, 'Glowy@123', d.nome);
    const slug = d.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.').slice(0, 20);
    const userId = await insertUser({
      auth_id: authId,
      tipo: 'EI',
      username: `${slug}.${d.cpf.slice(-4)}`,
      nome: d.nome,
      email: d.email,
      cpf: d.cpf,
      telefone: `119999900${nivel1.length + 2}`,
      patrocinador_id: masterId,
      kit_atual: d.kit,
      ativo_ciclo_atual: true,
    });
    await criarPedidoKitInicial(userId, d.kit);
    if (d.recompra > 0) await criarRecompra(userId, d.recompra);
    await criarCarteira(userId, Math.floor(d.recompra * 0.1), Math.floor(d.recompra * 0.05));
    nivel1.push(userId);
    console.log(`  ${d.nome}: ${userId}`);
  }

  // 4. EI nível 2 (downline de Ana)
  const nivel2Data = [
    { nome: 'Fernanda Costa', email: 'fernanda.costa@email.com', cpf: '22233344401', kit: 'PREMIUM' as const },
    { nome: 'Gabriel Rocha', email: 'gabriel.rocha@email.com', cpf: '22233344402', kit: 'STANDARD' as const },
  ];

  console.log('Criando EI nível 2...');
  for (const d of nivel2Data) {
    const authId = await createAuthUser(d.email, 'Glowy@123', d.nome);
    const slug = d.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.').slice(0, 20);
    const userId = await insertUser({
      auth_id: authId,
      tipo: 'EI',
      username: `${slug}.${d.cpf.slice(-4)}`,
      nome: d.nome,
      email: d.email,
      cpf: d.cpf,
      telefone: `1199998001${nivel2Data.indexOf(d)}`,
      patrocinador_id: nivel1[0], // Ana Lima
      kit_atual: d.kit,
      ativo_ciclo_atual: true,
    });
    await criarPedidoKitInicial(userId, d.kit);
    await criarCarteira(userId, 5000, 2000);
    console.log(`  ${d.nome}: ${userId}`);
  }

  // 5. EI pendente (sem kit — credenciamento em análise)
  console.log('Criando EI pendente...');
  const pendAuthId = await createAuthUser('pendente@email.com', 'Glowy@123', 'Joana Pendente');
  const pendId = await insertUser({
    auth_id: pendAuthId,
    tipo: 'EI',
    username: 'joana.pendente.9999',
    nome: 'Joana Pendente',
    email: 'pendente@email.com',
    cpf: '33344455501',
    patrocinador_id: masterId,
    ativo_ciclo_atual: false,
  });
  // Documento pendente
  await query(
    `INSERT INTO documentos (user_id, tipo, storage_path, mime, status)
     VALUES ($1,'RG','docs/joana-rg.jpg','image/jpeg','PENDENTE')`,
    [pendId]
  );
  console.log(`  Joana Pendente: ${pendId}`);

  // 6. Saque pendente para Ana Lima
  console.log('Criando saque pendente...');
  await query(
    `INSERT INTO saques (user_id, valor_centavos, taxa_centavos, status, pix_chave, pix_tipo)
     VALUES ($1, 5000, 200, 'SOLICITADO', 'ana.lima@email.com', 'EMAIL')`,
    [nivel1[0]]
  );

  console.log('\n=== Seed concluído! ===');
  console.log('\nCredenciais de acesso:');
  console.log('  ADMIN:  admin@glowy.com / Admin@123');
  console.log('  MASTER: master@glowy.com / Master@123');
  console.log('  EIs:    ana.lima@email.com / Glowy@123');
  console.log('          bruno.silva@email.com / Glowy@123');
  console.log('          carla.souza@email.com / Glowy@123');
  console.log('          diego.matos@email.com / Glowy@123');

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
