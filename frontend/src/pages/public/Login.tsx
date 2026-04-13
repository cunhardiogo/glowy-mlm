import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (d: FormData) => {
    try {
      await signIn(d.email, d.password);
      toast.success('Bem-vinda!');
      nav('/');
    } catch (err: any) {
      toast.error(err.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-glowy-accent to-white">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glowy-primary to-glowy-secondary" />
          <span className="text-xl font-bold text-glowy-dark">Glowy Life</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Entrar</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" className="input" {...register('password')} />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600 mt-4">
          Não tem conta? <Link to="/cadastro" className="text-glowy-primary font-semibold">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
