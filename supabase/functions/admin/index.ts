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
    if (user.tipo !== 'ADMIN') throw new HttpError(403, 'FORBIDDEN', 'Acesso negado');

    const supabase = adminClient();
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const segments = path.split('/').filter(Boolean);

    // GET /admin/dashboard
    if (path.endsWith('/dashboard') && method === 'GET') {
      const { data, error } = await supabase.rpc('get_admin_dashboard', {
        p_ciclo_ref: cicloAtual(),
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    // GET /admin/usuarios
    if (path.endsWith('/usuarios') && method === 'GET') {
      let query = supabase.from('users').select('*');
      const status = url.searchParams.get('status_ativo');
      if (status !== null) query = query.eq('status_ativo', status === 'true');
      const tipo = url.searchParams.get('tipo');
      if (tipo) query = query.eq('tipo', tipo);
      const { data, error } = await query.order('nome');
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    // GET /admin/documentos  |  PATCH /admin/documentos/:id
    if (segments.includes('documentos')) {
      if (method === 'GET' && segments.at(-1) === 'documentos') {
        const { data, error } = await supabase
          .from('documentos')
          .select('*, users!documentos_user_id_fkey(nome,email,username)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
      if (method === 'PATCH') {
        const id = segments.at(-1)!;
        const body = await req.json();
        const { data, error } = await supabase
          .from('documentos')
          .update({ status: body.status, observacao: body.observacao })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
    }

    // GET /admin/saques  |  PATCH /admin/saques/:id
    if (segments.includes('saques')) {
      if (method === 'GET' && segments.at(-1) === 'saques') {
        const { data, error } = await supabase
          .from('saques')
          .select('*, users!saques_user_id_fkey(nome,email,cpf)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
      if (method === 'PATCH') {
        const id = segments.at(-1)!;
        const body = await req.json();
        const { data, error } = await supabase
          .from('saques')
          .update({ status: body.status })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
    }

    // GET /admin/credenciamentos  |  PATCH /admin/credenciamentos/:id
    if (segments.includes('credenciamentos')) {
      if (method === 'GET' && segments.at(-1) === 'credenciamentos') {
        const { data, error } = await supabase.rpc('get_lista_credenciamentos');
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
      if (method === 'PATCH') {
        const id = segments.at(-1)!;
        const body = await req.json();
        const { data, error } = await supabase
          .from('credenciamentos')
          .update({ status: body.status })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return Response.json(data, { headers: corsHeaders });
      }
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
