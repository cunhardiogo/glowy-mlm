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

    if (path.endsWith('/recompra') && req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase.rpc('criar_pedido', {
        p_user_id: user.id,
        p_tipo: 'RECOMPRA',
        p_kit: null,
        p_valor_centavos: body.valor_centavos,
      });
      if (error) throw error;
      return Response.json(data, { status: 201, headers: corsHeaders });
    }

    if (path.endsWith('/upgrade') && req.method === 'POST') {
      const { data, error } = await supabase.rpc('criar_pedido', {
        p_user_id: user.id,
        p_tipo: 'UPGRADE',
        p_kit: null,
        p_valor_centavos: 0,
      });
      if (error) throw error;
      return Response.json(data, { status: 201, headers: corsHeaders });
    }

    if (path.endsWith('/confirmar-pagamento') && req.method === 'POST') {
      if (user.tipo !== 'ADMIN') throw new HttpError(403, 'FORBIDDEN', 'Acesso negado');
      const body = await req.json();
      const { data, error } = await supabase.rpc('confirmar_pagamento', {
        p_pedido_id: body.pedido_id,
        p_gateway_ref: body.gateway_ref,
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
