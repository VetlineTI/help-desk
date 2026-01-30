import { useState, useEffect, useRef } from 'react';
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketChatProps {
  ticketId: string;
  currentUser: { id: string; email: string };
}

export function TicketChat({ ticketId, currentUser }: TicketChatProps) {
  const { messages, sendMessage, isSending } = useSupabaseMessages(ticketId);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      await sendMessage(newMessage, currentUser);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={isSending}
        />
        <Button size="icon" type="submit" disabled={isSending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
