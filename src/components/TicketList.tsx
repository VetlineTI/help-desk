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
import { Ticket, ANALISTAS, TicketStatus } from '@/types/ticket';
import { Clock, CheckCircle, User, Trash2, Download, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  onAssign?: (ticketId: string, analistaId: string, analistaNome: string) => void;
  onResolve?: (ticketId: string) => void;
  onDelete?: (ticketId: string) => void;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  aguardando: { label: 'Aguardando', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  em_atendimento: { label: 'Em Atendimento', variant: 'default', icon: <User className="h-3 w-3" /> },
  resolvido: { label: 'Resolvido', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
};

export function TicketList({ tickets, isAdmin, onAssign, onResolve, onDelete }: TicketListProps) {
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
              <TableHead>Data</TableHead>
              {isAdmin && <TableHead>Analista</TableHead>}
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status];
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
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {ticket.status === 'aguardando' ? (
                        <Select
                          onValueChange={(v) => {
                            const analista = ANALISTAS.find((a) => a.id === v);
                            if (analista && onAssign) {
                              onAssign(ticket.id, analista.id, analista.nome);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Atribuir a..." />
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
