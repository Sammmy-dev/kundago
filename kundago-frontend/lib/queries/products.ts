import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
};

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products').then((r) => r.data),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get<Product>(`/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string; price: number; images?: string[]; stock: number }) =>
      api.post<Product>('/admin/products', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ name: string; description: string; price: number; images?: string[]; stock: number }>) =>
      api.put<Product>(`/admin/products/${id}`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
