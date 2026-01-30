import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ChatMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  sender_email: string;
  content: string;
  created_at: string;
}

export function useSupabaseMessages(ticketId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  // Buscar mensagens iniciais e configurar tempo real
  useEffect(() => {
    if (!ticketId) return;

    // Buscar mensagens existentes
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .schema('ti')
        .from('messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // Ouvir novas mensagens em tempo real
    const channel = supabase
      .channel(`ticket-chat-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'ti',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Mutação para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, user }: { content: string; user: any }) => {
      const { data, error } = await supabase
        .schema('ti')
        .from('messages')
        .insert([
          {
            ticket_id: ticketId,
            user_id: user.id,
            sender_email: user.email,
            content: content,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  return {
    messages,
    sendMessage: (content: string, user: any) => sendMessageMutation.mutateAsync({ content, user }),
    isSending: sendMessageMutation.isPending,
  };
}
