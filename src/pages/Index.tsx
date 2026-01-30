import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { TicketForm } from '@/components/TicketForm';
import { TicketList } from '@/components/TicketList';
import { Dashboard } from '@/components/Dashboard';
import { useTickets } from '@/hooks/useTickets';
import { TicketCategory } from '@/types/ticket';
import { Send, Settings, LayoutDashboard } from 'lucide-react';

const Index = () => {
  const { tickets, addTicket, assignTicket, startTicket, resolveTicket, deleteTicket } = useTickets();
  const [activeTab, setActiveTab] = useState('abrir');

  const handleSubmit = (ticket: {
    solicitante: string;
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => {
    addTicket(ticket);
  };

  const pendingTickets = tickets.filter((t) => t.status === 'aguardando');

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Header />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block border-r pr-4 border-slate-100">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Logado como: <span className="text-primary">{role || 'carregando...'}</span>
              </p>
              <p className="text-sm font-semibold text-slate-700">{session.user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/5">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {isAnalista && (
            <TabsList className={`grid w-full max-w-3xl mx-auto shadow-sm p-1 bg-slate-100/50 ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="abrir" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Send className="h-4 w-4" />
                Novo Chamado
              </TabsTrigger>
              <TabsTrigger value="fila" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="h-4 w-4" />
                Fila ({pendingTickets.length})
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="usuarios" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4" />
                  Usuários
                </TabsTrigger>
              )}
            </TabsList>
          )}

          <TabsContent value="abrir" className="max-w-5xl mx-auto focus-visible:outline-none">
            <div className="mb-8 border-b pb-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Meus Chamados</h1>
              <p className="text-muted-foreground mt-1">Abra novos chamados ou acompanhe o progresso das suas solicitações.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-[400px] shrink-0">
                <TicketForm onSubmit={handleSubmit} />
              </div>
              
              {!isAdmin && !isAnalista && (
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="font-bold text-lg text-slate-700 uppercase tracking-tight">Histórico de Chamados</h3>
                  </div>
                  <TicketList
                    tickets={tickets}
                    isAdmin={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fila">
            <TicketList
              tickets={tickets}
              isAdmin={true}
              onAssign={assignTicket}
              onStart={startTicket}
              onResolve={(ticketId, resolucao) => resolveTicket(ticketId, resolucao)}
              onDelete={deleteTicket}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard 
              tickets={tickets} 
              onStart={startTicket} 
              onResolve={(ticketId, resolucao) => resolveTicket(ticketId, resolucao)} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
