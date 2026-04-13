import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { toResponse } from '../_shared/errors.ts';
import { getAuthedUser } from '../_shared/auth.ts';
import { adminClient } from '../_shared/supabase.ts';

const ALLOWED_PATCH_FIELDS = ['telefone', 'pix_tipo', 'pix_chave'];

Deno.serve(async (req: Request) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  try {
    const user = await getAuthedUser(req);
    const supabase = adminClient();
    const method = req.method;

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (method === 'PATCH') {
      const body = await req.json();
      const update: Record<string, unknown> = {};
      for (const field of ALLOWED_PATCH_FIELDS) {
        if (field in body) update[field] = body[field];
      }
      const { data, error } = await supabase
        .from('users')
        .update(update)
        .eq('id', user.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405, headers: corsHeaders });
  } catch (err) {
    return toResponse(err);
  }
});
