import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { toResponse } from '../_shared/errors.ts';
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
    const cicloRef = url.searchParams.get('ciclo') ?? cicloAtual();

    const { data, error } = await supabase.rpc('get_bonus_resumo', {
      p_user_id: user.id,
      p_ciclo_ref: cicloRef,
    });
    if (error) throw error;
    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    return toResponse(err);
  }
});
