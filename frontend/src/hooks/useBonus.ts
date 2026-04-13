import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useBonus(ciclo?: string) {
  return useQuery({
    queryKey: ['bonus', ciclo],
    queryFn: async () => (await api.get('/bonus', { params: { ciclo } })).data,
  });
}

export function useBonusResumo(ciclo?: string) {
  return useQuery({
    queryKey: ['bonus', 'resumo', ciclo],
    queryFn: async () => (await api.get('/bonus/resumo', { params: { ciclo } })).data,
  });
}
