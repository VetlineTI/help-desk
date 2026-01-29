export type TicketCategory = 
  | 'Aparelho Corporativo'
  | 'E-mail corporativo'
  | 'Notebook'
  | 'TALAO app'
  | 'BI'
  | 'MOB Vendedor'
  | 'Desktop';

export type TicketStatus = 'aguardando' | 'em_atendimento' | 'resolvido';

export interface Ticket {
  id: string;
  assunto: string;
  categoria: TicketCategory;
  descricao: string;
  anexo?: string;
  anexoNome?: string;
  status: TicketStatus;
  criadoEm: string;
  analistaId?: string;
  analistaNome?: string;
}

export interface Analista {
  id: string;
  nome: string;
  especialidade: TicketCategory[];
}

export const CATEGORIAS: TicketCategory[] = [
  'Aparelho Corporativo',
  'E-mail corporativo',
  'Notebook',
  'TALAO app',
  'BI',
  'MOB Vendedor',
  'Desktop',
];

export const ANALISTAS: Analista[] = [
  { id: '1', nome: 'Carlos Silva', especialidade: ['Aparelho Corporativo', 'Notebook', 'Desktop'] },
  { id: '2', nome: 'Ana Souza', especialidade: ['E-mail corporativo', 'BI'] },
  { id: '3', nome: 'Pedro Santos', especialidade: ['TALAO app', 'MOB Vendedor'] },
];
