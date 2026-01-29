import { useState, useEffect } from 'react';
import { Ticket, TicketPriority } from '@/types/ticket';

const STORAGE_KEY = 'vetline_tickets';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTickets(JSON.parse(stored));
    }
  }, []);

  const saveTickets = (newTickets: Ticket[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTickets));
    setTickets(newTickets);
  };

  const addTicket = (ticket: Omit<Ticket, 'id' | 'status' | 'criadoEm'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      status: 'aguardando',
      criadoEm: new Date().toISOString(),
    };
    saveTickets([newTicket, ...tickets]);
    return newTicket;
  };

  const assignTicket = (ticketId: string, analistaId: string, analistaNome: string, prioridade: TicketPriority) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? { ...t, analistaId, analistaNome, prioridade, status: 'em_atendimento' as const }
        : t
    );
    saveTickets(updated);
  };

  const resolveTicket = (ticketId: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: 'resolvido' as const } : t
    );
    saveTickets(updated);
  };

  const deleteTicket = (ticketId: string) => {
    const updated = tickets.filter((t) => t.id !== ticketId);
    saveTickets(updated);
  };

  return {
    tickets,
    addTicket,
    assignTicket,
    resolveTicket,
    deleteTicket,
  };
}
