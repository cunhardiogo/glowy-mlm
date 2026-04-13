import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  telefone: z.string().min(10).max(20).optional().or(z.literal('')),
  pix_tipo: z.enum(['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']).optional(),
  pix_chave: z.string().min(3).optional().or(z.literal('')),
});
type F = z.infer<typeof schema>;

export default function Perfil() {
  const { profile, refreshProfile } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: {
      telefone: profile?.telefone ?? '',
      pix_tipo: profile?.pix_tipo as any ?? undefined,
      pix_chave: profile?.pix_chave ?? '',
    },
  });

  const update = useMutation({
    mutationFn: async (d: F) => {
      const patch: Record<string, unknown> = {};
      if (d.telefone) patch.telefone = d.telefone;
      if (d.pix_tipo) patch.pix_tipo = d.pix_tipo;
      if (d.pix_chave) patch.pix_chave = d.pix_chave;
      return (await api.patch('/perfil', patch)).data;
    },
    onSuccess: async () => { toast.success('Perfil atualizado'); await refreshProfile(); },
  });

  const [pwd, setPwd] = useState('');
  const changePwd = async () => {
    if (pwd.length < 6) return toast.error('Mínimo 6 caracteres');
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) toast.error(error.message); else { toast.success('Senha alterada'); setPwd(''); }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <div className="card p-5 space-y-2">
        <h2 className="font-semibold">Dados cadastrais</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">Nome</span><p className="font-medium">{profile?.nome}</p></div>
          <div><span className="text-slate-500">Username</span><p className="font-medium">{profile?.username}</p></div>
          <div><span className="text-slate-500">Email</span><p className="font-medium">{profile?.email}</p></div>
          <div><span className="text-slate-500">Kit</span><p className="font-medium">{profile?.kit_atual ?? 'Sem kit'}</p></div>
          <div><span className="text-slate-500">Graduação</span><p className="font-medium">{profile?.graduacao_reconhecimento ?? 'NENHUMA'}</p></div>
        </div>
      </div>

      <form className="card p-5 space-y-3" onSubmit={handleSubmit((d) => update.mutate(d))}>
        <h2 className="font-semibold">Dados de contato e PIX</h2>
        <div>
          <label className="label">Telefone</label>
          <input className="input" placeholder="(11) 99999-9999" {...register('telefone')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipo PIX</label>
            <select className="input" {...register('pix_tipo')}>
              <option value="">Selecione</option>
              <option value="CPF">CPF</option>
              <option value="EMAIL">Email</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ALEATORIA">Aleatória</option>
            </select>
          </div>
          <div>
            <label className="label">Chave PIX</label>
            <input className="input" {...register('pix_chave')} />
          </div>
        </div>
        <button className="btn-primary" disabled={isSubmitting}>Salvar</button>
      </form>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold">Alterar senha</h2>
        <input
          type="password"
          className="input"
          placeholder="Nova senha (mín. 6 caracteres)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="btn-secondary" onClick={changePwd}>Atualizar senha</button>
      </div>
    </div>
  );
}
