import { useState, useEffect, useRef } from 'react';
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Paperclip, X, FileIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface TicketChatProps {
  ticketId: string;
  currentUser: { id: string; email: string };
}

export function TicketChat({ ticketId, currentUser }: TicketChatProps) {
  const { messages, sendMessage, isSending } = useSupabaseMessages(ticketId);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        data: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || isSending) return;

    try {
      await sendMessage(
        newMessage, 
        currentUser, 
        attachedFile?.data, 
        attachedFile?.name
      );
      setNewMessage('');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-slate-50 overflow-hidden">
      <div className="bg-white p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Chat de Atendimento
        </h3>
        <span className="text-[10px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full uppercase font-bold">
          Tempo Real
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
              <p className="text-[11px] text-muted-foreground">Inicie a conversa para tirar dúvidas.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {isMe ? 'Você' : msg.sender_email.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-zinc-400">
                      {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border'
                    }`}
                  >
                    {msg.content}
                    {msg.file_url && (
                      <div className={`mt-2 p-2 rounded border flex flex-col gap-2 ${isMe ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[150px]">{msg.file_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 text-[10px] w-full flex items-center gap-1 ${isMe ? 'hover:bg-primary-foreground/20' : 'hover:bg-slate-200'}`}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = msg.file_url!;
                            link.download = msg.file_name || 'arquivo';
                            link.click();
                          }}
                        >
                          <Download className="h-3 w-3" />
                          Baixar Arquivo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {attachedFile && (
        <div className="px-3 py-2 bg-slate-100 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs truncate mr-2">
            <Paperclip className="h-3 w-3 text-primary" />
            <span className="font-medium truncate">{attachedFile.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => setAttachedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button 
          type="button"
          size="icon" 
          variant="ghost" 
          className="shrink-0 text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={isSending}
        />
        <Button size="icon" type="submit" disabled={isSending || (!newMessage.trim() && !attachedFile)}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
