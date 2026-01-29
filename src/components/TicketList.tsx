import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ticket, ANALISTAS, PRIORIDADES, TicketStatus, TicketPriority } from '@/types/ticket';
import { Clock, CheckCircle, User, Trash2, Download, ListChecks, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  onAssign?: (ticketId: string, analistaId: string, analistaNome: string, prioridade: TicketPriority) => void;
  onResolve?: (ticketId: string) => void;
  onDelete?: (ticketId: string) => void;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  aguardando: { label: 'Aguardando', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  em_atendimento: { label: 'Em Atendimento', variant: 'default', icon: <User className="h-3 w-3" /> },
  resolvido: { label: 'Resolvido', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  media: { label: 'Média', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-300' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700 border-red-300' },
};

export function TicketList({ tickets, isAdmin, onAssign, onResolve, onDelete }: TicketListProps) {
  const [selectedAnalista, setSelectedAnalista] = useState<Record<string, string>>({});
  const [selectedPrioridade, setSelectedPrioridade] = useState<Record<string, TicketPriority>>({});

  const handleAssign = (ticketId: string) => {
    const analistaId = selectedAnalista[ticketId];
    const prioridade = selectedPrioridade[ticketId];
    
    if (!analistaId || !prioridade) return;
    
    const analista = ANALISTAS.find((a) => a.id === analistaId);
    if (analista && onAssign) {
      onAssign(ticketId, analista.id, analista.nome, prioridade);
    }
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum chamado encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-primary flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          {isAdmin ? 'Gerenciar Chamados' : 'Fila de Chamados'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Data</TableHead>
              {isAdmin && <TableHead>Analista</TableHead>}
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status];
              const priority = ticket.prioridade ? priorityConfig[ticket.prioridade] : null;
              const canAssign = selectedAnalista[ticket.id] && selectedPrioridade[ticket.id];
              
              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.assunto}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.descricao}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                      {status.icon}
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.status === 'aguardando' && isAdmin ? (
                      <Select
                        value={selectedPrioridade[ticket.id] || undefined}
                        onValueChange={(v) => setSelectedPrioridade((prev) => ({ ...prev, [ticket.id]: v as TicketPriority }))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORIDADES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : priority ? (
                      <Badge variant="outline" className={priority.className}>
                        {priority.label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {ticket.status === 'aguardando' ? (
                        <Select
                          value={selectedAnalista[ticket.id] || ''}
                          onValueChange={(v) => setSelectedAnalista((prev) => ({ ...prev, [ticket.id]: v }))}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Selecionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ANALISTAS.map((analista) => (
                              <SelectItem key={analista.id} value={analista.id}>
                                {analista.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{ticket.analistaNome || '-'}</span>
                      )}
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {ticket.anexo && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ticket.anexo!;
                              link.download = ticket.anexoNome || 'anexo';
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.status === 'aguardando' && (
                          <Button
                            size="sm"
                            variant="default"
                            disabled={!canAssign}
                            onClick={() => handleAssign(ticket.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Atribuir
                          </Button>
                        )}
                        {ticket.status === 'em_atendimento' && onResolve && (
                          <Button size="sm" variant="outline" onClick={() => onResolve(ticket.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolver
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onDelete(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
