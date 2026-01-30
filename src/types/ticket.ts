export type TicketCategory =
  | 'Aparelho Corporativo'
  | 'E-mail corporativo'
  | 'Notebook'
  | 'TALAO app'
  | 'BI'
  | 'MOB Vendedor'
  | 'Desktop';

export type TicketStatus = 'aguardando' | 'em_atendimento' | 'resolvido';

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Ticket {
  id: string;
  numericId: string;
  solicitante: string;
  assunto: string;
  categoria: TicketCategory;
  descricao: string;
  anexo?: string;
  anexoNome?: string;
  status: TicketStatus;
  prioridade?: TicketPriority;
  criadoEm: string;
  atribuidoEm?: string;
  analistaId?: string;
  analistaNome?: string;
  resolucao?: string;
  resolvidoEm?: string;
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

export const PRIORIDADES: { value: TicketPriority; label: string }[] = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export const ANALISTAS: Analista[] = [
  { id: '1', nome: 'Carlos Silva', especialidade: ['Aparelho Corporativo', 'Notebook', 'Desktop'] },
  { id: '2', nome: 'Ana Souza', especialidade: ['E-mail corporativo', 'BI'] },
  { id: '3', nome: 'Pedro Santos', especialidade: ['TALAO app', 'MOB Vendedor'] },
];
