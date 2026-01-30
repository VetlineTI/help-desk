import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'analista';
  created_at: string;
}

export function useSupabaseProfiles() {
  const queryClient = useQueryClient();

  // Buscar todos os perfis
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('ti')
        .from('profiles')
        .select('*')
        .order('email');

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Atualizar role do usuário
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Profile['role'] }) => {
      const { data, error } = await supabase
        .schema('ti')
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return {
    profiles,
    isLoading,
    updateRole: (userId: string, role: Profile['role']) => updateRoleMutation.mutateAsync({ userId, role }),
  };
}
