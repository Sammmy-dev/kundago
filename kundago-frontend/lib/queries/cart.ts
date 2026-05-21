import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type CartResponse = {
  items: { productId: string; quantity: number; priceAtTime: number }[];
};

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<CartResponse>('/cart').then((r) => r.data),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      api.post<CartResponse>('/cart/add', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      api.put<CartResponse>('/cart/update', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      api.delete(`/cart/remove/${productId}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}
