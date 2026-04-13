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

    if (path.endsWith('/status') && method === 'GET') {
      const { data, error } = await supabase
        .from('credenciamentos')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (path.endsWith('/documentos') && method === 'GET') {
      const { data, error } = await supabase.rpc('get_documentos_user', {
        p_user_id: user.id,
      });
      if (error) throw error;
      return Response.json(data, { headers: corsHeaders });
    }

    if (path.endsWith('/documentos') && method === 'POST') {
      const body = await req.json();
      const { tipo, nome_original } = body;
      if (!tipo || !nome_original) throw new HttpError(400, 'MISSING_FIELDS', 'tipo e nome_original obrigatórios');

      const ext = nome_original.split('.').pop()?.toLowerCase() ?? 'bin';
      const storagePath = `${user.id}/${tipo}/${Date.now()}.${ext}`;

      const { data: signedData, error: signErr } = await supabase.storage
        .from('documentos')
        .createSignedUploadUrl(storagePath);
      if (signErr) throw signErr;

      const { data: doc, error: docErr } = await supabase
        .from('documentos')
        .insert({
          user_id: user.id,
          tipo,
          storage_path: storagePath,
          nome_original,
          status: 'PENDENTE',
        })
        .select()
        .maybeSingle();
      if (docErr) throw docErr;

      return Response.json({ documento: doc, upload_url: signedData }, { status: 201, headers: corsHeaders });
    }

    if (path.endsWith('/documentos/sign') && method === 'POST') {
      const body = await req.json();
      const { tipo, nome_original } = body;
      if (!tipo || !nome_original) throw new HttpError(400, 'MISSING_FIELDS', 'tipo e nome_original obrigatórios');

      const ext = nome_original.split('.').pop()?.toLowerCase() ?? 'bin';
      const storagePath = `${user.id}/${tipo}/${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUploadUrl(storagePath);
      if (error) throw error;

      return Response.json({ ...data, storage_path: storagePath }, { headers: corsHeaders });
    }

    throw new HttpError(404, 'NOT_FOUND', 'Rota não encontrada');
  } catch (err) {
    return toResponse(err);
  }
});
