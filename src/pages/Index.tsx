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
import { toast } from 'sonner';

import { UserList } from '@/components/UserList';

const Index = () => {

  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<'admin' | 'analista' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const { tickets, addTicket, assignTicket, startTicket, resolveTicket, deleteTicket } = useSupabaseTickets();
  const [activeTab, setActiveTab] = useState('abrir');

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .schema('ti')
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar role:', error);
        setRole('user'); // Fallback
      } else {
        setRole(data?.role || 'user');
      }
    } catch (err) {
      console.error('Erro:', err);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';
  const isAnalista = role === 'analista' || role === 'admin';
  const pendingTickets = tickets.filter((t) => t.status === 'aguardando');
  const userTickets = tickets.filter(
    (t) => t.solicitante === session?.user?.email || (t as any).user_id === session?.user?.id
  );

  // Garantir que aba ativa seja válida para o perfil do usuário
  useEffect(() => {
    if (session && !isAnalista && activeTab !== 'abrir' && activeTab !== 'meus_chamados') {
      setActiveTab('abrir');
    }
  }, [session, isAnalista, activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Sessão encerrada');
  };

  const handleSubmit = async (ticket: {
    solicitante: string;
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => {
    try {
      await addTicket(ticket);
      toast.success('Chamado aberto com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao abrir chamado: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userInitials = session?.user?.email
    ? session.user.email
        .split('@')[0]
        .split('.')
        .map((p: string) => p[0]?.toUpperCase())
        .slice(0, 2)
        .join('')
    : 'U';

  const getRoleLabel = (r: string | null) => {
    switch (r) {
      case 'admin':
        return { text: 'Administrador', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'analista':
        return { text: 'Analista TI', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { text: 'Colaborador', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleLabel(role);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-16">
      {/* Top Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
          <Header />
          
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 bg-slate-50/90 hover:bg-slate-100 transition-colors border border-slate-200/80 rounded-full py-1.5 px-3 shadow-sm">
              <div className="h-8 w-8 rounded-full bg-vetline-gradient text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
                {userInitials}
              </div>
              
              <div className="text-left hidden sm:block pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {session.user.email.split('@')[0]}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${roleInfo.color}`}>
                    {roleInfo.text}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium leading-tight block mt-0.5">
                  {session.user.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 px-3 text-slate-600 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline text-xs font-semibold">Sair</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Menu de Abas para Analista / Admin */}
          {isAnalista ? (
            <div className="flex justify-center">
              <TabsList className={`grid w-full max-w-2xl p-1 bg-slate-200/60 rounded-xl border border-slate-300/40 shadow-sm ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="abrir" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                  <Send className="h-3.5 w-3.5 text-primary" />
                  Novo Chamado
                </TabsTrigger>
                <TabsTrigger value="fila" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                  <Settings className="h-3.5 w-3.5 text-primary" />
                  Fila
                  {pendingTickets.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      {pendingTickets.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                  <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                  Dashboard
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="usuarios" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Usuários
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          ) : (
            /* Menu de Abas para Usuário Comum */
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-md p-1 bg-slate-200/60 rounded-xl border border-slate-300/40 shadow-sm grid-cols-2">
                <TabsTrigger value="abrir" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                  <Send className="h-3.5 w-3.5 text-primary" />
                  Novo Chamado
                </TabsTrigger>
                <TabsTrigger value="meus_chamados" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-semibold text-xs py-2 transition-all">
                  <Settings className="h-3.5 w-3.5 text-primary" />
                  Meus Chamados
                  {userTickets.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                      {userTickets.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          {/* Aba: Abrir Chamado */}
          <TabsContent value="abrir" className="w-full max-w-7xl mx-auto focus-visible:outline-none">
            <div className="mb-6 border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                {isAnalista ? 'Novo Chamado' : 'Abertura de Chamado'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isAnalista
                  ? 'Abra novos chamados ou acompanhe solicitações.'
                  : 'Preencha o formulário abaixo para abrir um chamado com o time de suporte.'}
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              <div className="w-full lg:w-[380px] xl:w-[400px] shrink-0">
                <TicketForm defaultSolicitante={session?.user?.email} onSubmit={handleSubmit} />
              </div>
              
              <div className="flex-1 min-w-0 w-full space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#82c341] animate-pulse" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-700 uppercase tracking-tight">
                    {isAnalista ? 'Meus Chamados Recentes' : 'Seus Últimos Chamados'}
                  </h3>
                </div>
                <TicketList
                  tickets={userTickets}
                  isAdmin={false}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba: Meus Chamados (visão completa para usuário comum) */}
          <TabsContent value="meus_chamados" className="w-full max-w-7xl mx-auto focus-visible:outline-none">
            <div className="mb-6 border-b pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Histórico de Chamados</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Acompanhe todos os seus chamados abertos e o andamento do suporte.</p>
            </div>
            <TicketList
              tickets={userTickets}
              isAdmin={false}
            />
          </TabsContent>

          {/* Aba: Fila (Analistas/Admin) */}
          {isAnalista && (
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
          )}

          {/* Aba: Dashboard (Analistas/Admin) */}
          {isAnalista && (
            <TabsContent value="dashboard">
              <Dashboard 
                tickets={tickets} 
                onStart={startTicket} 
                onResolve={(ticketId, resolucao) => resolveTicket(ticketId, resolucao)} 
              />
            </TabsContent>
          )}
          
          {/* Aba: Usuários (Admin) */}
          {isAdmin && (
            <TabsContent value="usuarios">
              <div className="max-w-5xl mx-auto focus-visible:outline-none">
                <div className="mb-8 border-b pb-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Cargos e Permissões</h1>
                  <p className="text-muted-foreground mt-1">Gerencie os níveis de acesso de todos os colaboradores do sistema.</p>
                </div>
                <UserList />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

