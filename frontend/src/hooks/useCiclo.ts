import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCicloAtual() {
  return useQuery({
    queryKey: ['ciclo', 'atual'],
    queryFn: async () => (await api.get('/ciclos/atual')).data,
  });
}

export function useCiclos() {
  return useQuery({
    queryKey: ['ciclos'],
    queryFn: async () => (await api.get('/ciclos')).data,
  });
}
