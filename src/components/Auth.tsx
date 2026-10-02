import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Eye, 
  EyeOff, 
  Zap, 
  MessageSquare, 
  CheckCircle2, 
  Headphones 
} from 'lucide-react';
import { toast } from 'sonner';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.session) {
          toast.success('Cadastro realizado com sucesso!');
        } else {
          toast.success('Cadastro realizado com sucesso! Você já pode entrar.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed')) {
        toast.error('E-mail não confirmado. Desative a confirmação de e-mail no painel do Supabase.');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('E-mail ou senha inválidos.');
      } else {
        toast.error(error.message || 'Erro na autenticação');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950">
      {/* Lado Esquerdo: Banner Institucional Corporativo */}
      <div className="relative lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Efeitos de Iluminação de Fundo com as cores da Vetline */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#82c341]/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#1f6a89]/30 rounded-full blur-[90px] pointer-events-none" />
        
        {/* Topo: Logo & Badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
              <img 
                src="/logo.png" 
                alt="Vetline Logo" 
                className="h-8 sm:h-9 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div className="border-l border-white/10 pl-3">
              <span className="text-white font-extrabold text-sm tracking-tight block">Help Desk TI</span>
              <span className="text-[11px] text-slate-400 font-medium">Vetline Brasil</span>
            </div>
          </div>
        </div>

        {/* Centro: Mensagem de Impacto & Benefícios */}
        <div className="relative z-10 my-10 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#82c341]/20 to-[#1f6a89]/20 border border-[#82c341]/40 text-[#a3e635] text-xs font-bold mb-6 shadow-sm">
            <Headphones className="h-3.5 w-3.5 text-[#82c341]" />
            <span>Central Unificada de Atendimento</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Suporte ágil e eficiente para o seu dia a dia corporativo.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Abra chamados técnicos, acompanhe o status de solicitações em tempo real e comunique-se diretamente com a equipe de TI da Vetline.
          </p>

          {/* Cards de Recursos */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#82c341]/40 transition-colors backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#82c341]/30 to-[#1f6a89]/30 text-[#a3e635] shrink-0 mt-0.5 border border-[#82c341]/30">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Abertura e Triagem Rápida</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Categorização automática por equipamento, sistema ou acesso.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#1f6a89]/50 transition-colors backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#82c341]/30 to-[#1f6a89]/30 text-[#38bdf8] shrink-0 mt-0.5 border border-[#1f6a89]/40">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Chat & Anexos em Tempo Real</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Interaja diretamente com o analista responsável pelo seu chamado.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#82c341]/40 transition-colors backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#82c341]/30 to-[#1f6a89]/30 text-[#a3e635] shrink-0 mt-0.5 border border-[#82c341]/30">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Histórico & Transparência</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Acompanhe todos os seus atendimentos anteriores e soluções aplicadas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Banner */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#82c341] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#82c341]"></span>
            </span>
            <span>Sistemas Operacionais</span>
          </div>
          <span>Vetline Help Desk v2.0</span>
        </div>
      </div>

      {/* Lado Direito: Painel de Autenticação */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-900/60">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8">
          {/* Seletor de Modo (Entrar vs Cadastrar) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`py-2 rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Acessar Conta
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`py-2 rounded-lg transition-all ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Novo Cadastro
            </button>
          </div>

          {/* Cabeçalho do Formulário */}
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? 'Criar Acesso Corporativo' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp
                ? 'Preencha seus dados para cadastrar seu usuário no sistema'
                : 'Insira seu e-mail corporativo e senha para continuar'}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail Corporativo
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.nome@vetlinebrasil.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1f6a89] focus:ring-[#82c341]/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 text-xs bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1f6a89] focus:ring-[#82c341]/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              className="w-full h-11 text-xs font-bold gap-2 shadow-lg mt-2 bg-vetline-gradient hover:opacity-95 text-white transition-all active:scale-[0.99] border-none" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : isSignUp ? (
                <>
                  Criar Minha Conta
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Entrar no Help Desk
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Rodapé de Segurança */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#82c341]" />
              <span>Autenticação Segura</span>
            </div>
            <span>Suporte: ramal 204</span>
          </div>
        </div>
      </div>
    </div>
  );
}
