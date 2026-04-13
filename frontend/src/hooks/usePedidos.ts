import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePedidos() {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => (await api.get('/pedidos')).data,
  });
}

export function useCriarRecompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { valor_centavos: number }) =>
      (await api.post('/pedidos/recompra', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });
}

export function useCriarUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/pedidos/upgrade')).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });
}
