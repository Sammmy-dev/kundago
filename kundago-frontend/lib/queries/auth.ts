import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type LoginInput = { email: string; password: string };
type RegisterInput = { fullName: string; email: string; phone: string; password: string };
type AuthResponse = { token: string; user: { id: string; fullName: string; email: string; phone?: string; role: 'USER' | 'ADMIN' } };

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) =>
      api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ user: AuthResponse['user'] }>('/auth/me').then((r) => r.data),
  });
}
