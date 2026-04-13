import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatusPill } from '@/components/ui/StatusPill';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Documentos() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: raw } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => (await api.get('/credenciamento/documentos')).data,
  });
  const docs: any[] = Array.isArray(raw) ? raw : raw?.data ?? [];

  const upload = useMutation({
    mutationFn: async ({ tipo, file }: { tipo: string; file: File }) => {
      const fd = new FormData();
      fd.append('tipo', tipo);
      fd.append('arquivo', file);
      return (await api.post('/credenciamento/documentos', fd)).data;
    },
    onSuccess: () => { toast.success('Documento enviado'); qc.invalidateQueries({ queryKey: ['documentos'] }); },
    onError: () => toast.error('Erro ao enviar documento'),
  });

  const TIPOS_UPLOAD = ['RG_FRENTE', 'RG_VERSO', 'CPF', 'SELFIE', 'COMPROVANTE_RESIDENCIA'];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold">Documentos enviados</h2>
        {docs.length > 0 ? docs.map((d: any) => (
          <div key={d.id} className="flex items-center justify-between border-b pb-3 last:border-0">
            <div>
              <p className="font-medium text-sm">{d.tipo}</p>
              {d.observacao && <p className="text-xs text-red-600 mt-1">Observação: {d.observacao}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={d.status} />
              {(d.status === 'REJEITADO' || d.status === 'PENDENTE') && (
                <label className="btn-secondary cursor-pointer flex items-center gap-1 text-sm">
                  <Upload size={14} />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(d.tipo);
                      upload.mutate({ tipo: d.tipo, file: f }, { onSettled: () => setUploading(null) });
                    }}
                  />
                  {uploading === d.tipo ? 'Enviando...' : 'Reenviar'}
                </label>
              )}
            </div>
          </div>
        )) : (
          <p className="text-slate-500 text-sm">Nenhum documento enviado ainda.</p>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Enviar novo documento</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TIPOS_UPLOAD.map((tipo) => (
            <label key={tipo} className="btn-secondary cursor-pointer flex items-center gap-2 justify-center text-sm">
              <Upload size={14} />
              {tipo.replace(/_/g, ' ')}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploading(tipo);
                  upload.mutate({ tipo, file: f }, { onSettled: () => setUploading(null) });
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4 text-sm bg-amber-50 border border-amber-200 rounded-xl">
        <p className="font-semibold">Dicas para aprovação</p>
        <p className="text-slate-700 mt-1">
          Envie imagens nítidas com boa iluminação. Documentos aceitos: RG (frente e verso), CPF, selfie segurando o documento, comprovante de residência recente.
        </p>
      </div>
    </div>
  );
}
