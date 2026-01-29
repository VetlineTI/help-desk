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
  const { tickets, addTicket, assignTicket, resolveTicket, deleteTicket } = useTickets();
  const [activeTab, setActiveTab] = useState('abrir');

  const handleSubmit = (ticket: {
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => {
    addTicket(ticket);
    setActiveTab('fila');
  };

  const pendingTickets = tickets.filter((t) => t.status === 'aguardando');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="abrir" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Abrir Chamado
            </TabsTrigger>
            <TabsTrigger value="fila" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin ({pendingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="abrir" className="max-w-2xl mx-auto">
            <TicketForm onSubmit={handleSubmit} />
          </TabsContent>

          <TabsContent value="fila">
            <TicketList
              tickets={tickets}
              isAdmin
              onAssign={assignTicket}
              onResolve={resolveTicket}
              onDelete={deleteTicket}
            />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard tickets={tickets} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
