import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { TicketForm } from '@/components/TicketForm';
import { TicketList } from '@/components/TicketList';
import { Dashboard } from '@/components/Dashboard';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { TicketCategory } from '@/types/ticket';
import { Send, Settings, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@/components/Auth';
import { Button } from '@/components/ui/button';
import { UserManagement } from '@/components/UserManagement';

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const { tickets, isLoading, isError, queryError, addTicket, assignTicket, startTicket, resolveTicket, deleteTicket } = useSupabaseTickets();
  const [activeTab, setActiveTab] = useState('abrir');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .schema('ti')
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('ERRO SUPABASE ROLE:', error.message);
        setRoleError(error.message);
        setRole('user'); 
      } else if (data) {
        setRole(data.role);
        setRoleError(null);
      } else {
        setRoleError('Perfil não encontrado');
        setRole('user');
      }
    } catch (e) {
      console.error('Erro inesperado:', e);
      setRole('user');
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  const handleSubmit = async (ticket: {
    solicitante: string;
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => {
    await addTicket(ticket);
    setActiveTab(role === 'admin' ? 'fila' : 'abrir');
  };

  if (!session) return <Auth />;

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Settings className="text-destructive h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Erro ao Carregar Dados</h2>
            <p className="text-sm text-muted-foreground font-mono bg-slate-50 p-2 rounded border">
              {queryError instanceof Error ? queryError.message : 'Erro desconhecido'}
            </p>
            <p className="text-xs text-destructive/80 mt-2 bg-destructive/5 p-2 rounded border border-destructive/10">
              Dica: Verifique se você executou o SQL no painel do Supabase.
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-4">
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            <Button variant="outline" onClick={handleLogout}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || (session && role === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <p className="text-muted-foreground animate-pulse font-medium">Carregando permissões e dados...</p>
            <p className="text-xs text-muted-foreground">Verificando acesso para {session.user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="mt-4">
            <LogOut className="h-4 w-4 mr-2" />
            Sair e tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const pendingTickets = tickets.filter((t) => t.status === 'aguardando');
  const isAdmin = role === 'admin';
  const isAnalista = role === 'analista' || role === 'admin';

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="flex items-center justify-between px-6 bg-white border-b sticky top-0 z-50">
        <Header />
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">
              Logado como: <span className="font-bold text-primary">{role || 'carregando...'}</span>
            </p>
            <p className="text-sm font-medium">{session.user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full max-w-2xl mx-auto ${isAdmin ? 'grid-cols-4' : (isAnalista ? 'grid-cols-3' : 'grid-cols-1')}`}>
            <TabsTrigger value="abrir" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Abrir Chamado
            </TabsTrigger>
            {isAnalista && (
              <>
                <TabsTrigger value="fila" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin ({pendingTickets.length})
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
              </>
            )}
            {isAdmin && (
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="abrir" className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Meus Chamados</h1>
              <p className="text-muted-foreground">Aqui você pode abrir novos chamados ou acompanhar os seus.</p>
            </div>
            
            <div className="grid gap-8">
              <TicketForm onSubmit={handleSubmit} />
              
              {!isAdmin && !isAnalista && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Histórico de Chamados</h3>
                  <TicketList
                    tickets={tickets}
                    isAdmin={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {isAnalista && (
            <>
              <TabsContent value="fila">
                <TicketList
                  tickets={tickets}
                  isAdmin={isAnalista}
                  onAssign={assignTicket}
                  onStart={startTicket}
                  onResolve={(ticketId, resolucao) => resolveTicket(ticketId, resolucao)}
                  onDelete={isAdmin ? deleteTicket : undefined}
                />
              </TabsContent>

              <TabsContent value="dashboard">
                <Dashboard 
                  tickets={tickets} 
                  onStart={startTicket} 
                  onResolve={(ticketId, resolucao) => resolveTicket(ticketId, resolucao)} 
                />
              </TabsContent>
            </>
          )}

          {isAdmin && (
            <TabsContent value="usuarios">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
