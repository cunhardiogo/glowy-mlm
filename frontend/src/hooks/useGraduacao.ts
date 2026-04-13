import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useGraduacaoAtual() {
  return useQuery({
    queryKey: ['graduacao', 'atual'],
    queryFn: async () => (await api.get('/qualificacao/atual')).data,
  });
}

export function useHistoricoGraduacao() {
  return useQuery({
    queryKey: ['graduacao', 'historico'],
    queryFn: async () => (await api.get('/qualificacao/historico')).data,
  });
}
