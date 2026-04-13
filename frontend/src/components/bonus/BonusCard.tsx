import { LucideIcon } from 'lucide-react';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';

interface Props { nome: string; tipo: string; total_centavos: number; icon: LucideIcon; }

export function BonusCard({ nome, tipo, total_centavos, icon: Icon }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-glowy-accent flex items-center justify-center text-glowy-primary">
          <Icon size={20} />
        </div>
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{tipo}</span>
      </div>
      <p className="text-sm text-slate-500">{nome}</p>
      <p className="text-2xl font-bold mt-1"><MoneyDisplay cents={total_centavos} /></p>
    </div>
  );
}
