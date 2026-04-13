import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { toResponse, HttpError } from '../_shared/errors.ts';
import { getAuthedUser } from '../_shared/auth.ts';
import { adminClient } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const user = await getAuthedUser(req);
    const supabase = adminClient();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (path.endsWith('/carteira')) {
      const { data: carteira, error: cErr } = await supabase
        .from('carteiras')
        .select('saldo, saldo_bloqueado')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cErr) throw cErr;

      return Response.json(carteira ?? { saldo: 0, saldo_bloqueado: 0 }, { headers: corsHeaders });
    }

    if (path.endsWith('/saques')) {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('saques')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }

      if (method === 'POST') {
        const body = await req.json();
        const valor = Number(body.valor_centavos);
        if (!valor || valor <= 0) throw new HttpError(400, 'INVALID_VALUE', 'Valor inválido');

        // Verificar saldo
        const { data: carteira, error: cErr } = await supabase
          .from('carteiras')
          .select('saldo')
          .eq('user_id', user.id)
          .maybeSingle();
        if (cErr) throw cErr;
        if (!carteira || carteira.saldo < valor) {
          throw new HttpError(422, 'INSUFFICIENT_BALANCE', 'Saldo insuficiente');
        }

        const { data, error } = await supabase
          .from('saques')
          .insert({
            user_id: user.id,
            valor_centavos: valor,
            status: 'PENDENTE',
            pix_tipo: user.pix_tipo,
            pix_chave: user.pix_chave,
          })
          .select()
          .maybeSingle();
        if (error) throw error;
        return Response.json(data, { status: 201, headers: corsHeaders });
      }
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
