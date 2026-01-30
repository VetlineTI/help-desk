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
      <div className="flex items-center justify-between px-6 bg-white border-b sticky top-0 z-50">
        <Header />
      </div>
      
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="abrir" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Abrir Chamado
            </TabsTrigger>
            <TabsTrigger value="fila" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Gerenciar ({pendingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="abrir" className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Abrir Chamado</h1>
              <p className="text-muted-foreground">Preencha o formulário para abrir um novo chamado de suporte.</p>
            </div>
            
            <TicketForm onSubmit={handleSubmit} />
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
