import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(err: Error) { console.error('ErrorBoundary:', err); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="card p-6 max-w-md text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Algo deu errado</h1>
            <p className="text-slate-600 mb-4">{this.state.error.message}</p>
            <button className="btn-primary" onClick={() => location.reload()}>Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
