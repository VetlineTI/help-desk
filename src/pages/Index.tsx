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
