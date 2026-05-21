import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type Order = {
  _id: string;
  userId: string;
  items: { productId: string; quantity: number; priceAtTime: number }[];
  totalAmount: number;
  paymentMethod: 'STRIPE' | 'WAVE' | 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'DELIVERED';
  deliveryAddress: string;
  createdAt: string;
};

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders').then((r) => r.data),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => api.get<Order[]>('/admin/orders').then((r) => r.data),
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { paymentMethod: 'STRIPE' | 'WAVE' | 'COD'; deliveryAddress: string }) =>
      api.post<Order>('/orders/checkout', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) =>
      api.put<Order>(`/admin/orders/${id}/status`, { orderStatus }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
