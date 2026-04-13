import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDownline(depth = 3) {
  return useQuery({
    queryKey: ['rede', 'downline', depth],
    queryFn: async () => (await api.get(`/rede/downline?depth=${depth}`)).data,
  });
}

export function useUpline() {
  return useQuery({
    queryKey: ['rede', 'upline'],
    queryFn: async () => (await api.get('/rede/upline')).data,
  });
}

export function useLinhas(ciclo?: string) {
  return useQuery({
    queryKey: ['rede', 'linhas', ciclo],
    queryFn: async () => (await api.get('/rede/linhas', { params: { ciclo } })).data,
  });
}
