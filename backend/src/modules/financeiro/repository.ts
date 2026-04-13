import { supabaseAdmin } from '../../config/db.js';

export async function saldoCarteira(userId: string) {
  const { data } = await supabaseAdmin
    .from('carteira')
    .select('saldo_liberado_centavos,saldo_provisionado_centavos,total_recebido_centavos')
    .eq('user_id', userId)
    .maybeSingle();
  return {
    liberado_centavos: Number(data?.saldo_liberado_centavos ?? 0),
    provisionado_centavos: Number(data?.saldo_provisionado_centavos ?? 0),
    total_recebido_centavos: Number(data?.total_recebido_centavos ?? 0),
  };
}
