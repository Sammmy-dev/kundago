import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type Parcel = {
  _id: string;
  userId: string;
  pickupName: string;
  pickupAddress: string;
  pickupPhone: string;
  dropoffName: string;
  dropoffAddress: string;
  dropoffPhone: string;
  packageSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  notes?: string;
  paymentMethod: 'STRIPE' | 'WAVE' | 'COD';
  status: 'PENDING' | 'PICKED' | 'DELIVERED';
  createdAt: string;
};

export function useParcels() {
  return useQuery({
    queryKey: ['parcels'],
    queryFn: () => api.get<Parcel[]>('/parcels').then((r) => r.data),
  });
}

export function useAdminParcels() {
  return useQuery({
    queryKey: ['parcels', 'admin'],
    queryFn: () => api.get<Parcel[]>('/admin/parcels').then((r) => r.data),
  });
}

export function useCreateParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      pickupName: string;
      pickupAddress: string;
      pickupPhone: string;
      dropoffName: string;
      dropoffAddress: string;
      dropoffPhone: string;
      packageSize: 'SMALL' | 'MEDIUM' | 'LARGE';
      notes?: string;
      paymentMethod: 'STRIPE' | 'WAVE' | 'COD';
    }) => api.post<Parcel>('/parcels', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parcels'] }),
  });
}

export function useUpdateParcelStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put<Parcel>(`/admin/parcels/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
    },
  });
}
