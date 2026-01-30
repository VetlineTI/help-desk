import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Ticket, TicketPriority } from '@/types/ticket';

// Tipo do banco de dados (snake_case)
interface TicketDB {
  id: string;
  numeric_id: string;
  solicitante: string;
  assunto: string;
  categoria: string;
  descricao: string;
  anexo?: string;
  anexo_nome?: string;
  status: string;
  prioridade?: string;
  criado_em: string;
  atribuido_em?: string;
  analista_id?: string;
  analista_nome?: string;
  resolucao?: string;
  resolvido_em?: string;
}

// Converter de DB para App
const dbToTicket = (db: TicketDB): Ticket => ({
  id: db.id,
  numericId: db.numeric_id,
  solicitante: db.solicitante,
  assunto: db.assunto,
  categoria: db.categoria as any,
  descricao: db.descricao,
  anexo: db.anexo,
  anexoNome: db.anexo_nome,
  status: db.status as any,
  prioridade: db.prioridade as any,
  criadoEm: db.criado_em,
  atribuidoEm: db.atribuido_em,
  analistaId: db.analista_id,
  analistaNome: db.analista_nome,
  resolucao: db.resolucao,
  resolvidoEm: db.resolvido_em,
});

// Converter de App para DB
const ticketToDb = (ticket: Partial<Ticket>): Partial<TicketDB> => ({
  numeric_id: ticket.numericId,
  solicitante: ticket.solicitante,
  assunto: ticket.assunto,
  categoria: ticket.categoria,
  descricao: ticket.descricao,
  anexo: ticket.anexo,
  anexo_nome: ticket.anexoNome,
  status: ticket.status,
  prioridade: ticket.prioridade,
  criado_em: ticket.criadoEm,
  atribuido_em: ticket.atribuidoEm,
  analista_id: ticket.analistaId,
  analista_nome: ticket.analistaNome,
  resolucao: ticket.resolucao,
  resolvido_em: ticket.resolvidoEm,
});

export function useSupabaseTickets() {
  const queryClient = useQueryClient();

  // Buscar todos os tickets
  const { data: tickets = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .schema('ti')
          .from('tickets')
          .select('*')
          .order('criado_em', { ascending: false });

        if (error) {
          console.error('Detalhes do erro Supabase:', error);
          // Se o erro for "schema not found" ou "relation not found", pode ser o passo do "Exposed Schemas"
          throw new Error(error.message || 'Erro ao conectar ao schema ti');
        }
        return (data as TicketDB[]).map(dbToTicket);
      } catch (e) {
        console.error('Erro ao buscar tickets:', e);
        throw e;
      }
    },
    retry: 1, // Limita tentativas para não travar
  });

  // Adicionar ticket
  const addTicketMutation = useMutation({
    mutationFn: async (partialTicket: {
      solicitante: string;
      assunto: string;
      categoria: string;
      descricao: string;
      anexo?: string;
      anexoNome?: string;
    }) => {
      // Gerar numericId único
      const numericId = `TK${Date.now().toString().slice(-8)}`;

      const { data: { user } } = await supabase.auth.getUser();

      const ticket: Omit<Ticket, 'id'> = {
        ...partialTicket,
        numericId,
        status: 'aguardando' as const,
        criadoEm: new Date().toISOString(),
        categoria: partialTicket.categoria as any,
      };

      const dbTicket = {
        ...ticketToDb(ticket),
        user_id: user?.id
      };

      const { data, error } = await supabase
        .schema('ti')
        .from('tickets')
        .insert([dbTicket])
        .select()
        .single();

      if (error) throw error;
      return dbToTicket(data as TicketDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Atribuir ticket
  const assignTicketMutation = useMutation({
    mutationFn: async ({
      ticketId,
      analistaId,
      analistaNome,
      prioridade,
    }: {
      ticketId: string;
      analistaId: string;
      analistaNome: string;
      prioridade: TicketPriority;
    }) => {
      const { data, error } = await supabase
        .schema('ti')
        .from('tickets')
        .update({
          analista_id: analistaId,
          analista_nome: analistaNome,
          prioridade,
          status: 'aguardando',
          atribuido_em: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return dbToTicket(data as TicketDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Iniciar ticket
  const startTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase
        .schema('ti')
        .from('tickets')
        .update({ status: 'em_atendimento' })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return dbToTicket(data as TicketDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Resolver ticket
  const resolveTicketMutation = useMutation({
    mutationFn: async ({ ticketId, resolucao }: { ticketId: string; resolucao: string }) => {
      const { data, error } = await supabase
        .schema('ti')
        .from('tickets')
        .update({
          status: 'resolvido',
          resolucao,
          resolvido_em: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return dbToTicket(data as TicketDB);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // Deletar ticket
  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .schema('ti')
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  return {
    tickets,
    isLoading,
    isError,
    queryError,
    addTicket: (ticket: {
      solicitante: string;
      assunto: string;
      categoria: string;
      descricao: string;
      anexo?: string;
      anexoNome?: string;
    }) => addTicketMutation.mutateAsync(ticket),
    assignTicket: (ticketId: string, analistaId: string, analistaNome: string, prioridade: TicketPriority) =>
      assignTicketMutation.mutateAsync({ ticketId, analistaId, analistaNome, prioridade }),
    startTicket: (ticketId: string) => startTicketMutation.mutateAsync(ticketId),
    resolveTicket: (ticketId: string, resolucao: string) =>
      resolveTicketMutation.mutateAsync({ ticketId, resolucao }),
    deleteTicket: (ticketId: string) => deleteTicketMutation.mutateAsync(ticketId),
  };
}
