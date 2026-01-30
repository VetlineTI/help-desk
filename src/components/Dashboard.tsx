import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Ticket, TicketPriority } from '@/types/ticket';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Eye } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  tickets: Ticket[];
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
}

function TicketListItem({ ticket, onViewDescription }: TicketListItemProps) {
  const priority = ticket.prioridade ? priorityConfig[ticket.prioridade] : null;
  
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b last:border-b-0 text-sm">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className="font-mono text-muted-foreground shrink-0">#{ticket.numericId}</span>
        <span className="truncate" title={ticket.solicitante}>{ticket.solicitante || '-'}</span>
        <span className="truncate text-muted-foreground" title={ticket.analistaNome}>{ticket.analistaNome || '-'}</span>
        {priority ? (
          <Badge variant="outline" className={`${priority.className} shrink-0`}>
            {priority.label}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
        <span className="text-muted-foreground shrink-0">
          {ticket.atribuidoEm 
            ? format(parseISO(ticket.atribuidoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : '-'
          }
        </span>
      </div>
      <Button size="sm" variant="ghost" onClick={() => onViewDescription(ticket)}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Dashboard({ tickets }: DashboardProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);

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
      all: filteredTickets,
      aguardando: filteredTickets.filter((t) => t.status === 'aguardando'),
      emAtendimento: filteredTickets.filter((t) => t.status === 'em_atendimento'),
      resolvidos: filteredTickets.filter((t) => t.status === 'resolvido'),
    };
  }, [filteredTickets]);

  const stats = useMemo(() => {
    return {
      total: ticketsByStatus.all.length,
      aguardando: ticketsByStatus.aguardando.length,
      emAtendimento: ticketsByStatus.emAtendimento.length,
      resolvidos: ticketsByStatus.resolvidos.length,
    };
  }, [ticketsByStatus]);

  const selectedMonthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        
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
        Estatísticas de {selectedMonthLabel} de {selectedYear}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Total de Chamados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mb-3">no período selecionado</p>
            {ticketsByStatus.all.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b grid grid-cols-6 gap-2">
                  <span>ID</span>
                  <span>Solicitante</span>
                  <span>Analista</span>
                  <span>Prioridade</span>
                  <span>Atribuído em</span>
                  <span></span>
                </div>
                {ticketsByStatus.all.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} onViewDescription={setViewingTicket} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aguardando */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.aguardando}</div>
            <p className="text-xs text-muted-foreground mb-3">na fila de espera</p>
            {ticketsByStatus.aguardando.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b grid grid-cols-6 gap-2">
                  <span>ID</span>
                  <span>Solicitante</span>
                  <span>Analista</span>
                  <span>Prioridade</span>
                  <span>Atribuído em</span>
                  <span></span>
                </div>
                {ticketsByStatus.aguardando.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} onViewDescription={setViewingTicket} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Em Atendimento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.emAtendimento}</div>
            <p className="text-xs text-muted-foreground mb-3">sendo resolvidos</p>
            {ticketsByStatus.emAtendimento.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b grid grid-cols-6 gap-2">
                  <span>ID</span>
                  <span>Solicitante</span>
                  <span>Analista</span>
                  <span>Prioridade</span>
                  <span>Atribuído em</span>
                  <span></span>
                </div>
                {ticketsByStatus.emAtendimento.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} onViewDescription={setViewingTicket} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolvidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvidos}</div>
            <p className="text-xs text-muted-foreground mb-3">finalizados com sucesso</p>
            {ticketsByStatus.resolvidos.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground border-b grid grid-cols-6 gap-2">
                  <span>ID</span>
                  <span>Solicitante</span>
                  <span>Analista</span>
                  <span>Prioridade</span>
                  <span>Atribuído em</span>
                  <span></span>
                </div>
                {ticketsByStatus.resolvidos.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} onViewDescription={setViewingTicket} />
                ))}
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
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
