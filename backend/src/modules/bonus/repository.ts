import { supabaseAdmin } from '../../config/db.js';

export async function listarBonus(userId: string, cicloRef?: string) {
  let q = supabaseAdmin
    .from('bonus_lancamentos')
    .select('*')
    .eq('beneficiario_id', userId)
    .order('created_at', { ascending: false })
    .limit(500);
  if (cicloRef) q = q.eq('ciclo_ref', cicloRef);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function resumoBonus(userId: string, cicloRef: string) {
  const { data, error } = await supabaseAdmin.rpc('get_bonus_resumo', {
    p_user_id: userId,
    p_ciclo_ref: cicloRef,
  });
  if (error) throw error;

  const rows = (data as Array<{ tipo: string; total: string }>) ?? [];
  const res = {
    ciclo_ref: cicloRef,
    primeiro_pedido_centavos: 0,
    upgrade_centavos: 0,
    produtividade_centavos: 0,
    equiparacao_centavos: 0,
    total_centavos: 0,
    por_tipo: [] as Array<{ tipo: string; total_centavos: number }>,
  };
  for (const r of rows) {
    const v = Number(r.total);
    res.total_centavos += v;
    if (r.tipo === 'PRIMEIRO_PEDIDO') res.primeiro_pedido_centavos = v;
    else if (r.tipo === 'UPGRADE') res.upgrade_centavos = v;
    else if (r.tipo === 'PRODUTIVIDADE') res.produtividade_centavos = v;
    else if (r.tipo === 'EQUIPARACAO') res.equiparacao_centavos = v;
  }
  res.por_tipo = rows.map((r) => ({ tipo: r.tipo, total_centavos: Number(r.total) }));
  return res;
}
