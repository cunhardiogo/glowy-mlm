import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Users, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-glowy-accent via-white to-glowy-secondary/30">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glowy-primary to-glowy-secondary" />
          <span className="text-xl font-bold text-glowy-dark">Glowy Life</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary">Entrar</Link>
          <Link to="/cadastro" className="btn-primary">Cadastrar</Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto text-center py-20 px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-glowy-dark mb-6">
          Seja uma <span className="text-glowy-primary">Empreendedora Independente</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Construa sua rede, gere renda com nossos produtos premium de beleza e cuidados.
        </p>
        <Link to="/cadastro" className="btn-primary text-lg px-8 py-3">
          <Sparkles size={20} /> Começar agora
        </Link>
      </section>

      <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-20">
        {[
          { icon: TrendingUp, title: 'Renda Escalável', text: 'Ganhe com suas vendas e da sua rede.' },
          { icon: Users, title: 'Rede Colaborativa', text: 'Construa equipes e cresça em conjunto.' },
          { icon: Award, title: '11 Graduações', text: 'De Bronze a Diamante Coroa.' },
        ].map((b) => (
          <div key={b.title} className="card p-6">
            <b.icon className="text-glowy-primary mb-3" size={28} />
            <h3 className="font-bold text-lg mb-1">{b.title}</h3>
            <p className="text-slate-600 text-sm">{b.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
