import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { toResponse, HttpError } from '../_shared/errors.ts';
import { getAuthedUser } from '../_shared/auth.ts';
import { adminClient } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const user = await getAuthedUser(req);
    if (user.tipo !== 'ADMIN') throw new HttpError(403, 'FORBIDDEN', 'Acesso negado');

    const supabase = adminClient();
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/abrir') && req.method === 'POST') {
      const body = await req.json();
      if (!body.ref_mes) throw new HttpError(400, 'MISSING_FIELDS', 'ref_mes obrigatório');
      const { data, error } = await supabase.rpc('abrir_ciclo', { ref_mes: body.ref_mes });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (path.endsWith('/fechar') && req.method === 'POST') {
      const body = await req.json();
      if (!body.ref_mes) throw new HttpError(400, 'MISSING_FIELDS', 'ref_mes obrigatório');
      const { data, error } = await supabase.rpc('fechar_ciclo', { ref_mes: body.ref_mes });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
