import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { toResponse, HttpError } from '../_shared/errors.ts';
import { getAuthedUser } from '../_shared/auth.ts';
import { adminClient } from '../_shared/supabase.ts';

function cicloAtual(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const user = await getAuthedUser(req);
    const supabase = adminClient();
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/downline')) {
      const depth = Math.min(Number(url.searchParams.get('depth') ?? '3'), 10);
      const { data, error } = await supabase.rpc('get_rede_downline', {
        p_path: user.path,
        p_max_depth: depth,
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (path.endsWith('/upline')) {
      const { data, error } = await supabase.rpc('get_rede_upline', {
        p_path: user.path,
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (path.endsWith('/linhas')) {
      const { data, error } = await supabase.rpc('get_rede_linhas', {
        p_user_id: user.id,
        p_ciclo_ref: cicloAtual(),
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
