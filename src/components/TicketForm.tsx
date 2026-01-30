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
  onSubmit: (ticket: {
    solicitante: string;
    assunto: string;
    categoria: TicketCategory;
    descricao: string;
    anexo?: string;
    anexoNome?: string;
  }) => void;
}

export function TicketForm({ onSubmit }: TicketFormProps) {
  const [solicitante, setSolicitante] = useState('');
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
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-primary flex items-center gap-2">
          <Send className="h-5 w-5" />
          Abrir Novo Chamado
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="solicitante">Seu Nome *</Label>
            <Input
              id="solicitante"
              placeholder="Digite seu nome completo"
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto *</Label>
            <Input
              id="assunto"
              placeholder="Digite o assunto do chamado"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as TicketCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente o problema ou solicitação"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anexo">Anexo (opcional)</Label>
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
                className="w-full justify-start"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {anexoNome || 'Selecionar arquivo'}
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
                >
                  Remover
                </Button>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Enviar Chamado
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
