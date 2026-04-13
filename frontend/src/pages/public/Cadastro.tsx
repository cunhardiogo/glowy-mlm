import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';

const dadosSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  senha: z.string().min(8, 'Mínimo 8 caracteres'),
  patrocinador_username: z.string().min(3, 'Informe o patrocinador'),
});
type DadosData = z.infer<typeof dadosSchema>;

const KITS = [
  {
    id: 'STANDARD' as const,
    preco: 36000,
    nome: 'Kit Standard',
    bullets: ['Kit inicial completo', 'Acesso à rede', 'Bônus até 5 níveis'],
  },
  {
    id: 'PREMIUM' as const,
    preco: 72000,
    nome: 'Kit Premium',
    bullets: ['Tudo do Standard', 'Produtos exclusivos', 'Bônus até 10 níveis', 'Níveis extras de produtividade'],
  },
];

export default function Cadastro() {
  const { patrocinador: patrocinadorParam } = useParams();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [dados, setDados] = useState<DadosData | null>(null);
  const [kit, setKit] = useState<'STANDARD' | 'PREMIUM'>('STANDARD');
  const [aceitou, setAceitou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DadosData>({
    resolver: zodResolver(dadosSchema),
    defaultValues: { patrocinador_username: patrocinadorParam ?? '' },
  });

  const onDados = (d: DadosData) => { setDados(d); setStep(2); };

  const onKit = () => setStep(3);

  const finalizar = async () => {
    if (!aceitou) return toast.error('Aceite o contrato');
    if (!dados) return;
    setSubmitting(true);
    try {
      await api.post('/credenciamento', { ...dados, kit });
      toast.success('Cadastro enviado! Aguarde aprovação por email.');
      nav('/login');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glowy-accent to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glowy-primary to-glowy-secondary" />
          <span className="text-xl font-bold">Glowy Life</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-glowy-primary' : 'bg-slate-200'}`} />
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1: Dados pessoais */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onDados)} className="space-y-3">
              <h2 className="text-xl font-bold mb-4">Dados pessoais</h2>

              <div>
                <label className="label">Nome completo</label>
                <input className="input" {...register('nome')} />
                {errors.nome && <p className="text-xs text-red-600 mt-0.5">{errors.nome.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">CPF</label>
                  <input className="input" placeholder="000.000.000-00" {...register('cpf')} />
                  {errors.cpf && <p className="text-xs text-red-600 mt-0.5">{errors.cpf.message}</p>}
                </div>
                <div>
                  <label className="label">Telefone</label>
                  <input className="input" placeholder="(00) 00000-0000" {...register('telefone')} />
                  {errors.telefone && <p className="text-xs text-red-600 mt-0.5">{errors.telefone.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input type="email" className="input" {...register('email')} />
                {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Senha</label>
                <input type="password" className="input" {...register('senha')} />
                {errors.senha && <p className="text-xs text-red-600 mt-0.5">{errors.senha.message}</p>}
              </div>

              <div>
                <label className="label">Username do patrocinador</label>
                <input className="input" {...register('patrocinador_username')} readOnly={!!patrocinadorParam} />
                {errors.patrocinador_username && <p className="text-xs text-red-600 mt-0.5">{errors.patrocinador_username.message}</p>}
              </div>

              <button type="submit" className="btn-primary w-full mt-2">Próximo</button>
            </form>
          )}

          {/* Step 2: Kit */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Escolha seu kit</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {KITS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKit(k.id)}
                    className={`card p-4 text-left transition ${kit === k.id ? 'ring-2 ring-glowy-primary' : 'hover:ring-1 hover:ring-slate-200'}`}
                  >
                    <h3 className="font-bold">{k.nome}</h3>
                    <p className="text-2xl font-bold text-glowy-primary my-2">
                      <MoneyDisplay cents={k.preco} />
                    </p>
                    <ul className="text-sm space-y-1">
                      {k.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-1.5">
                          <Check size={13} className="text-emerald-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Voltar</button>
                <button className="btn-primary flex-1" onClick={onKit}>Próximo</button>
              </div>
            </div>
          )}

          {/* Step 3: Contrato */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Contrato de adesão</h2>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 max-h-64 overflow-auto leading-relaxed">
                <p className="font-semibold mb-2">Termos de adesão Glowy Life</p>
                <p>Como Empreendedora Independente (EI) da Glowy Life, você concorda com o plano de marketing vigente, o código de ética e boas práticas, e com as obrigações fiscais previstas pela legislação brasileira.</p>
                <p className="mt-2">A aprovação do cadastro depende da análise dos documentos enviados. A renda varia de acordo com o esforço individual e a rede construída. Não há garantia de renda mínima.</p>
                <p className="mt-2">O kit inicial não é reembolsável após a ativação. Você pode solicitar o cancelamento do contrato a qualquer momento.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceitou}
                  onChange={(e) => setAceitou(e.target.checked)}
                  className="w-4 h-4 accent-glowy-primary"
                />
                <span className="text-sm">Li e aceito os termos e condições</span>
              </label>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)}>Voltar</button>
                <button
                  disabled={!aceitou || submitting}
                  className="btn-primary flex-1"
                  onClick={finalizar}
                >
                  {submitting ? 'Enviando...' : 'Finalizar cadastro'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-600 mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-glowy-primary font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
