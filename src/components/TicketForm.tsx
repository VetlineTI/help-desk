import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIAS, TicketCategory } from '@/types/ticket';
import { Paperclip, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TicketFormProps {
  defaultSolicitante?: string;
  onSubmit: (ticket: {
    solicitante: string;
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => void;
}

export function TicketForm({ defaultSolicitante = '', onSubmit }: TicketFormProps) {
  const [solicitante, setSolicitante] = useState(defaultSolicitante);
  const [assunto, setAssunto] = useState('');
  const [categoria, setCategoria] = useState<TicketCategory | ''>('');
  const [descricao, setDescricao] = useState('');
  const [anexo, setAnexo] = useState<string | undefined>();
  const [anexoNome, setAnexoNome] = useState<string | undefined>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo: 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnexo(reader.result as string);
        setAnexoNome(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!solicitante.trim()) {
      toast.error('Preencha seu nome');
      return;
    }
    if (!assunto.trim()) {
      toast.error('Preencha o assunto');
      return;
    }
    if (!categoria) {
      toast.error('Selecione uma categoria');
      return;
    }
    if (!descricao.trim()) {
      toast.error('Preencha a descrição');
      return;
    }

    onSubmit({
      solicitante: solicitante.trim(),
      assunto: assunto.trim(),
      categoria,
      descricao: descricao.trim(),
      anexo,
      anexoNome,
    });

    setSolicitante('');
    setAssunto('');
    setCategoria('');
    setDescricao('');
    setAnexo(undefined);
    setAnexoNome(undefined);
    
    toast.success('Chamado aberto com sucesso!');
  };

  return (
    <Card className="shadow-sm border-slate-200/80 bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-vetline-gradient text-white flex items-center justify-center font-bold shadow-sm">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Novo Chamado</CardTitle>
            <p className="text-xs text-slate-500 font-normal">Preencha os detalhes da sua solicitação</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="solicitante" className="text-xs font-semibold text-slate-700">
              Solicitante <span className="text-red-500">*</span>
            </Label>
            <Input
              id="solicitante"
              placeholder="Digite seu nome ou e-mail"
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              className="h-9 text-xs bg-slate-50/40 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assunto" className="text-xs font-semibold text-slate-700">
              Assunto <span className="text-red-500">*</span>
            </Label>
            <Input
              id="assunto"
              placeholder="Resumo breve do problema ou necessidade"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="h-9 text-xs bg-slate-50/40 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria" className="text-xs font-semibold text-slate-700">
              Categoria <span className="text-red-500">*</span>
            </Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as TicketCategory)}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/40 border-slate-200 focus:bg-white">
                <SelectValue placeholder="Selecione a categoria do suporte" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-xs font-semibold text-slate-700">
              Descrição Detalhada <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descricao"
              placeholder="Explique detalhadamente o ocorrido, mensagens de erro e contexto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="text-xs bg-slate-50/40 border-slate-200 focus:bg-white transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="anexo" className="text-xs font-semibold text-slate-700">
              Anexo ou Captura de Tela (Opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="anexo"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('anexo')?.click()}
                className="w-full justify-start h-9 text-xs font-medium text-slate-600 bg-slate-50/40 hover:bg-slate-100/60 border-dashed border-slate-300"
              >
                <Paperclip className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{anexoNome || 'Anexar imagem, documento ou PDF (máx. 5MB)'}</span>
              </Button>
              {anexoNome && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAnexo(undefined);
                    setAnexoNome(undefined);
                  }}
                  className="h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-10 text-xs font-bold gap-2 shadow-md bg-vetline-gradient hover:opacity-95 text-white border-none transition-all active:scale-[0.99]">
            <Send className="h-3.5 w-3.5" />
            Enviar Solicitação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
