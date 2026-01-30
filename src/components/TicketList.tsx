import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ticket, PRIORIDADES, TicketStatus, TicketPriority } from '@/types/ticket';
import { Clock, CheckCircle, User, Trash2, Download, ListChecks, UserPlus, Eye, Play, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSupabaseProfiles } from '@/hooks/useSupabaseProfiles';
import { TicketChat } from './TicketChat';
import { supabase } from '@/lib/supabaseClient';

interface TicketListProps {
  tickets: Ticket[];
  isAdmin?: boolean;
  onAssign?: (ticketId: string, analistaId: string, analistaNome: string, prioridade: TicketPriority) => void;
  onStart?: (ticketId: string) => void;
  onResolve?: (ticketId: string, resolucao: string) => void;
  onDelete?: (ticketId: string) => void;
}

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  aguardando: { label: 'Aguardando', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  em_atendimento: { label: 'Em Atendimento', variant: 'default', icon: <User className="h-3 w-3" /> },
  resolvido: { label: 'Resolvido', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'bg-green-100 text-green-700 border-green-300' },
  media: { label: 'Média', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  alta: { label: 'Alta', className: 'bg-red-100 text-red-700 border-red-300' },
  urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700 border-red-300' },
};

export function TicketList({ tickets, isAdmin, onAssign, onStart, onResolve, onDelete }: TicketListProps) {
  const { profiles } = useSupabaseProfiles();
  const analistasList = profiles.filter(p => p.role === 'analista' || p.role === 'admin');
  
  const [selectedAnalista, setSelectedAnalista] = useState<Record<string, string>>({});
  const [selectedPrioridade, setSelectedPrioridade] = useState<Record<string, TicketPriority>>({});
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolucaoText, setResolucaoText] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser({ id: user.id, email: user.email! });
    });
  }, []);

  const handleAssign = (ticketId: string) => {
    const analistaId = selectedAnalista[ticketId];
    const prioridade = selectedPrioridade[ticketId];
    
    if (!analistaId || !prioridade) return;
    
    const analista = analistasList.find((a) => a.id === analistaId);
    if (analista && onAssign) {
      onAssign(ticketId, analista.id, analista.email, prioridade);
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
              <TableHead>ID</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Analista</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                    <span className="font-mono text-sm text-muted-foreground">#{ticket.numericId}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{ticket.assunto}</p>
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
                  <TableCell>
                    {ticket.status === 'aguardando' && isAdmin ? (
                      <Select
                        value={selectedAnalista[ticket.id] || ''}
                        onValueChange={(v) => setSelectedAnalista((prev) => ({ ...prev, [ticket.id]: v }))}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {analistasList.map((analista) => (
                            <SelectItem key={analista.id} value={analista.id}>
                              {analista.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{ticket.analistaNome || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingTicket(ticket)}
                        title="Ver detalhes e Chat"
                      >
                        <Eye className="h-4 w-4" />
                        {!isAdmin && <span className="ml-2 text-xs">Ver/Chat</span>}
                      </Button>
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
                      {isAdmin && ticket.status === 'aguardando' && !ticket.analistaNome && (
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
                      {isAdmin && ticket.status === 'aguardando' && ticket.analistaNome && onStart && (
                        <Button size="sm" variant="default" onClick={() => onStart(ticket.id)}>
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {isAdmin && ticket.status === 'em_atendimento' && onResolve && (
                        <Button size="sm" variant="outline" onClick={() => { setResolvingTicket(ticket); setResolucaoText(''); }}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                      )}
                      {isAdmin && onDelete && (
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!viewingTicket} onOpenChange={() => setViewingTicket(null)}>
        <DialogContent className="sm:max-w-[700px] gap-0 p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-r bg-slate-50/50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 mb-4">
                  <span className="font-mono text-muted-foreground">#{viewingTicket?.numericId}</span>
                  <span className="truncate">{viewingTicket?.assunto}</span>
                </DialogTitle>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">Categoria</p>
                    <Badge variant="outline">{viewingTicket?.categoria}</Badge>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">Descrição</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{viewingTicket?.descricao}</p>
                  </div>
                  {viewingTicket?.anexoNome && (
                    <div>
                      <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">Anexo</p>
                      <p className="text-sm flex items-center gap-2 text-primary font-medium cursor-pointer hover:underline">
                        <Download className="h-4 w-4" />
                        {viewingTicket.anexoNome}
                      </p>
                    </div>
                  )}
                  {viewingTicket?.resolucao && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="font-bold text-xs text-green-700 mb-1 uppercase tracking-wider">Resolução Final</p>
                      <p className="text-sm text-green-800 whitespace-pre-wrap">{viewingTicket.resolucao}</p>
                    </div>
                  )}
                </div>
              </DialogHeader>
            </div>
            <div className="p-0 h-[500px]">
              {viewingTicket && currentUser ? (
                <TicketChat ticketId={viewingTicket.id} currentUser={currentUser} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground p-8 text-center text-sm">
                  Carregando chat...
                </div>
              )}
            </div>
          </div>
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
                  <Button 
                    onClick={() => {
                      if (resolvingTicket && onResolve) {
                        onResolve(resolvingTicket.id, resolucaoText);
                        setResolvingTicket(null);
                        setResolucaoText('');
                      }
                    }} 
                    disabled={!resolucaoText.trim()}
                  >
                    Confirmar Resolução
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
