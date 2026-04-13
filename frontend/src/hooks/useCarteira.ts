import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCarteira() {
  return useQuery({
    queryKey: ['carteira'],
    queryFn: async () => (await api.get('/financeiro/carteira')).data,
  });
}

export function useSaques() {
  return useQuery({
    queryKey: ['saques'],
    queryFn: async () => (await api.get('/financeiro/saques')).data,
  });
}

export function useCriarSaque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { valor_centavos: number; pix_chave: string; pix_tipo: string }) =>
      (await api.post('/financeiro/saques', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saques'] });
      qc.invalidateQueries({ queryKey: ['carteira'] });
    },
  });
}
