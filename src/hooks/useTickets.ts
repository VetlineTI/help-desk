import { useState, useEffect } from 'react';
import { Ticket, TicketPriority } from '@/types/ticket';

const STORAGE_KEY = 'vetline_tickets';
const COUNTER_KEY = 'vetline_ticket_counter';

function generateNumericId(): string {
  const stored = localStorage.getItem(COUNTER_KEY);
  const counter = stored ? parseInt(stored, 10) + 1 : 1;
  localStorage.setItem(COUNTER_KEY, counter.toString());
  return counter.toString().padStart(6, '0');
}

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

  const addTicket = (ticket: Omit<Ticket, 'id' | 'numericId' | 'status' | 'criadoEm'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: crypto.randomUUID(),
      numericId: generateNumericId(),
      status: 'aguardando',
      criadoEm: new Date().toISOString(),
    };
    saveTickets([newTicket, ...tickets]);
    return newTicket;
  };

  const assignTicket = (ticketId: string, analistaId: string, analistaNome: string, prioridade: TicketPriority) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? { 
            ...t, 
            analistaId, 
            analistaNome, 
            prioridade, 
            status: 'em_atendimento' as const,
            atribuidoEm: new Date().toISOString()
          }
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
