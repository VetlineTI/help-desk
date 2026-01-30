import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Ticket, TicketPriority } from '@/types/ticket';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Eye, Play } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  tickets: Ticket[];
  onStart?: (ticketId: string) => void;
  onResolve?: (ticketId: string, resolucao: string) => void;
}

const MONTHS = [
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
];

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-300' },
  media: { label: 'Média', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  alta: { label: 'Alta', className: 'bg-red-100 text-red-700 border-red-300' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700 border-red-300' },
};

interface TicketListItemProps {
  ticket: Ticket;
  onViewDescription: (ticket: Ticket) => void;
  onStart?: (ticketId: string) => void;
  onResolve?: (ticket: Ticket) => void;
}

function TicketListItem({ ticket, onViewDescription, onStart, onResolve }: TicketListItemProps) {
  const priority = ticket.prioridade ? priorityConfig[ticket.prioridade] : null;
  
  return (
    <div className="flex flex-col gap-1 py-2 px-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onViewDescription(ticket)}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-muted-foreground text-xs">#{ticket.numericId}</span>
        {priority && (
          <Badge variant="outline" className={`${priority.className} text-[10px] h-5 px-1.5`}>
            {priority.label}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs" title={ticket.solicitante}>{ticket.solicitante || 'Sem solicitante'}</span>
          <span className="truncate text-xs text-muted-foreground" title={ticket.analistaNome}>
            {ticket.analistaNome || '-'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-1.5">
         <div className="text-[10px] text-muted-foreground">
          {ticket.atribuidoEm 
            ? format(parseISO(ticket.atribuidoEm), "dd/MM HH:mm", { locale: ptBR })
            : format(parseISO(ticket.criadoEm), "dd/MM HH:mm", { locale: ptBR })
          }
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {ticket.status === 'aguardando' && ticket.analistaNome && onStart && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs"
              onClick={() => onStart(ticket.id)}
            >
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
          )}
          {ticket.status === 'em_atendimento' && onResolve && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 px-2 text-xs"
              onClick={() => onResolve(ticket)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolver
            </Button>
          )}
          <Eye className="h-3 w-3 text-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ tickets, onStart, onResolve }: DashboardProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolucaoText, setResolucaoText] = useState('');

  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    tickets.forEach((t) => {
      yearsSet.add(new Date(t.criadoEm).getFullYear());
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [tickets, currentYear]);

  const filteredTickets = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));

    return tickets.filter((ticket) => {
      const ticketDate = parseISO(ticket.criadoEm);
      return isWithinInterval(ticketDate, { start, end });
    });
  }, [tickets, selectedMonth, selectedYear]);

  const ticketsByStatus = useMemo(() => {
    return {
      backlog: filteredTickets.filter((t) => !t.analistaNome),
      aguardando: filteredTickets.filter((t) => t.status === 'aguardando' && !!t.analistaNome),
      emAtendimento: filteredTickets.filter((t) => t.status === 'em_atendimento'),
      resolvidos: filteredTickets.filter((t) => t.status === 'resolvido'),
    };
  }, [filteredTickets]);

  const stats = useMemo(() => {
    return {
      backlog: ticketsByStatus.backlog.length,
      aguardando: ticketsByStatus.aguardando.length,
      emAtendimento: ticketsByStatus.emAtendimento.length,
      resolvidos: ticketsByStatus.resolvidos.length,
    };
  }, [ticketsByStatus]);

  const selectedMonthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || '';

  const handleResolveClick = (ticket: Ticket) => {
    setResolvingTicket(ticket);
    setResolucaoText('');
  };

  const handleConfirmResolve = () => {
    if (resolvingTicket && onResolve) {
      onResolve(resolvingTicket.id, resolucaoText);
      setResolvingTicket(null);
      setResolucaoText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Kanban</h2>
        
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-muted-foreground">
        Visualização de chamados de {selectedMonthLabel} de {selectedYear}
      </p>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] items-start">
        {/* Backlog */}
        <Card className="min-w-[320px] w-[320px] flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 shrink-0 bg-slate-200 dark:bg-slate-800 rounded-t-lg">
            <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Backlog</CardTitle>
            <div className="bg-white/50 dark:bg-black/20 p-1 rounded">
              <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 p-2">
            <div className="flex items-baseline justify-between px-2 mb-2">
               <div className="text-2xl font-bold text-slate-700 dark:text-slate-400">{stats.backlog}</div>
               <span className="text-xs font-medium text-slate-500 uppercase">Aguardando</span>
            </div>
            
            {ticketsByStatus.backlog.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {ticketsByStatus.backlog.map((ticket) => (
                  <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                     <TicketListItem ticket={ticket} onViewDescription={setViewingTicket} onStart={onStart} onResolve={handleResolveClick} />
                  </div>
                ))}
              </div>
            ) : (
               <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
                 Nenhum item
               </div>
            )}
          </CardContent>
        </Card>

        {/* Aguardando */}
        <Card className="min-w-[320px] w-[320px] flex flex-col h-full bg-amber-50/50 dark:bg-amber-950/20 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 shrink-0 bg-amber-100 dark:bg-amber-900/60 rounded-t-lg">
            <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-200 uppercase tracking-wide">Aguardando</CardTitle>
            <div className="bg-amber-200/50 dark:bg-black/20 p-1 rounded">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 p-2">
            <div className="flex items-baseline justify-between px-2 mb-2">
               <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.aguardando}</div>
               <span className="text-xs font-medium text-amber-600/70 uppercase">Fila</span>
            </div>
            
            {ticketsByStatus.aguardando.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {ticketsByStatus.aguardando.map((ticket) => (
                   <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded shadow-sm border border-amber-100 dark:border-amber-900/30">
                    <TicketListItem ticket={ticket} onViewDescription={setViewingTicket} onStart={onStart} onResolve={handleResolveClick} />
                  </div>
                ))}
              </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-amber-400/50 italic text-sm">
                 Nenhum item
               </div>
            )}
          </CardContent>
        </Card>

        {/* Em Atendimento */}
        <Card className="min-w-[320px] w-[320px] flex flex-col h-full bg-blue-50/50 dark:bg-blue-950/20 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 shrink-0 bg-blue-100 dark:bg-blue-900/60 rounded-t-lg">
            <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-200 uppercase tracking-wide">Em Atendimento</CardTitle>
            <div className="bg-blue-200/50 dark:bg-black/20 p-1 rounded">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 p-2">
            <div className="flex items-baseline justify-between px-2 mb-2">
               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.emAtendimento}</div>
               <span className="text-xs font-medium text-blue-600/70 uppercase">Executando</span>
            </div>
            
            {ticketsByStatus.emAtendimento.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {ticketsByStatus.emAtendimento.map((ticket) => (
                  <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded shadow-sm border border-blue-100 dark:border-blue-900/30">
                    <TicketListItem ticket={ticket} onViewDescription={setViewingTicket} onStart={onStart} onResolve={handleResolveClick} />
                  </div>
                ))}
              </div>
             ) : (
                <div className="flex-1 flex items-center justify-center text-blue-400/50 italic text-sm">
                 Nenhum item
               </div>
            )}
          </CardContent>
        </Card>

        {/* Resolvidos */}
        <Card className="min-w-[320px] w-[320px] flex flex-col h-full bg-green-50/50 dark:bg-green-950/20 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 shrink-0 bg-green-100 dark:bg-green-900/60 rounded-t-lg">
            <CardTitle className="text-sm font-bold text-green-700 dark:text-green-200 uppercase tracking-wide">Resolvidos</CardTitle>
            <div className="bg-green-200/50 dark:bg-black/20 p-1 rounded">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 p-2">
             <div className="flex items-baseline justify-between px-2 mb-2">
               <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolvidos}</div>
               <span className="text-xs font-medium text-green-600/70 uppercase">Finalizados</span>
            </div>
            
            {ticketsByStatus.resolvidos.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {ticketsByStatus.resolvidos.map((ticket) => (
                  <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded shadow-sm border border-green-100 dark:border-green-900/30">
                    <TicketListItem ticket={ticket} onViewDescription={setViewingTicket} onStart={onStart} onResolve={handleResolveClick} />
                  </div>
                ))}
              </div>
            ) : (
               <div className="flex-1 flex items-center justify-center text-green-400/50 italic text-sm">
                 Nenhum item
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewingTicket} onOpenChange={() => setViewingTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">#{viewingTicket?.numericId}</span>
              {viewingTicket?.assunto}
            </DialogTitle>
            <DialogDescription className="text-left pt-4">
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-1">Solicitante</p>
                  <p>{viewingTicket?.solicitante || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Categoria</p>
                  <Badge variant="outline">{viewingTicket?.categoria}</Badge>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Descrição</p>
                  <p className="whitespace-pre-wrap">{viewingTicket?.descricao}</p>
                </div>
                {viewingTicket?.anexoNome && (
                  <div>
                    <p className="font-medium text-foreground mb-1">Anexo</p>
                    <p>{viewingTicket.anexoNome}</p>
                  </div>
                )}
                {viewingTicket?.resolucao && (
                  <div>
                    <p className="font-medium text-foreground mb-1">Resolução</p>
                    <p className="whitespace-pre-wrap">{viewingTicket.resolucao}</p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal de Resolução */}
      <Dialog open={!!resolvingTicket} onOpenChange={() => { setResolvingTicket(null); setResolucaoText(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Chamado #{resolvingTicket?.numericId}</DialogTitle>
            <DialogDescription className="text-left pt-4">
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-2">Descreva a resolução do chamado:</p>
                  <Textarea
                    placeholder="Digite aqui as observações sobre a resolução..."
                    value={resolucaoText}
                    onChange={(e) => setResolucaoText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setResolvingTicket(null); setResolucaoText(''); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmResolve} disabled={!resolucaoText.trim()}>
                    Confirmar Resolução
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
