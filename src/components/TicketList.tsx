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

const statusConfig: Record<TicketStatus, { label: string; className: string; icon: React.ReactNode }> = {
  aguardando: { 
    label: 'Aguardando', 
    className: 'bg-amber-50 text-amber-800 border-amber-200/80 font-medium', 
    icon: <Clock className="h-3 w-3 text-amber-600" /> 
  },
  em_atendimento: { 
    label: 'Em Atendimento', 
    className: 'bg-blue-50 text-blue-800 border-blue-200/80 font-medium', 
    icon: <User className="h-3 w-3 text-blue-600" /> 
  },
  resolvido: { 
    label: 'Resolvido', 
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium', 
    icon: <CheckCircle className="h-3 w-3 text-emerald-600" /> 
  },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  baixa: { label: 'Baixa', className: 'bg-slate-100 text-slate-700 border-slate-200 font-medium' },
  media: { label: 'Média', className: 'bg-sky-50 text-sky-700 border-sky-200 font-medium' },
  alta: { label: 'Alta', className: 'bg-amber-50 text-amber-700 border-amber-200 font-medium' },
  urgente: { label: 'Urgente', className: 'bg-red-50 text-red-700 border-red-200 font-bold' },
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
      <Card className="shadow-sm border-slate-200/80 bg-white">
        <CardContent className="py-14 text-center">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ListChecks className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Nenhum chamado encontrado</p>
          <p className="text-xs text-slate-400 mt-0.5">Novas solicitações aparecerão aqui automaticamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200/80 bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-3.5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            {isAdmin ? 'Gerenciamento de Fila & Chamados' : 'Meus Chamados'}
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">
            {tickets.length} chamado{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[650px]">
            <TableHeader>
              <TableRow className="bg-slate-50/40 hover:bg-slate-50/40 border-b border-slate-100">
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">ID</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Assunto</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Categoria</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Prioridade</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Abertura</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Responsável</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const status = statusConfig[ticket.status];
                const priority = ticket.prioridade ? priorityConfig[ticket.prioridade] : null;
                const canAssign = selectedAnalista[ticket.id] && selectedPrioridade[ticket.id];
                
                return (
                  <TableRow key={ticket.id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100/80">
                    <TableCell className="py-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                        #{ticket.numericId}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="font-semibold text-xs text-slate-900 line-clamp-1">{ticket.assunto}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ticket.solicitante}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50">
                        {ticket.categoria}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={`${status.className} text-[10px] flex items-center gap-1.5 w-fit px-2 py-0.5`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {ticket.status === 'aguardando' && isAdmin ? (
                        <Select
                          value={selectedPrioridade[ticket.id] || undefined}
                          onValueChange={(v) => setSelectedPrioridade((prev) => ({ ...prev, [ticket.id]: v as TicketPriority }))}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
                            <SelectValue placeholder="Prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORIDADES.map((p) => (
                              <SelectItem key={p.value} value={p.value} className="text-xs">
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : priority ? (
                        <Badge variant="outline" className={`${priority.className} text-[10px] px-2 py-0.5`}>
                          {priority.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 py-3 whitespace-nowrap">
                      {format(new Date(ticket.criadoEm), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-3">
                      {ticket.status === 'aguardando' && isAdmin ? (
                        <Select
                          value={selectedAnalista[ticket.id] || ''}
                          onValueChange={(v) => setSelectedAnalista((prev) => ({ ...prev, [ticket.id]: v }))}
                        >
                          <SelectTrigger className="w-[160px] h-8 text-xs bg-white">
                            <SelectValue placeholder="Selecionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {analistasList.map((analista) => (
                              <SelectItem key={analista.id} value={analista.id} className="text-xs">
                                {analista.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-slate-600 truncate max-w-[150px] block">{ticket.analistaNome || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-slate-600 hover:text-primary hover:bg-primary/10"
                          onClick={() => setViewingTicket(ticket)}
                          title="Ver detalhes e Chat"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {!isAdmin && <span className="ml-1 text-[11px] font-semibold">Chat</span>}
                        </Button>
                        {ticket.anexo && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-slate-600 hover:text-slate-900"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ticket.anexo!;
                              link.download = ticket.anexoNome || 'anexo';
                              link.click();
                            }}
                            title="Baixar anexo"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isAdmin && ticket.status === 'aguardando' && !ticket.analistaNome && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 text-xs"
                            disabled={!canAssign}
                            onClick={() => handleAssign(ticket.id)}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            Atribuir
                          </Button>
                        )}
                        {isAdmin && ticket.status === 'aguardando' && ticket.analistaNome && onStart && (
                          <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => onStart(ticket.id)}>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {isAdmin && ticket.status === 'em_atendimento' && onResolve && (
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setResolvingTicket(ticket); setResolucaoText(''); }}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                            Resolver
                          </Button>
                        )}
                        {isAdmin && onDelete && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(ticket.id)}
                            title="Excluir chamado"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
