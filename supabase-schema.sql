-- Usar o schema ti
set search_path to ti, public;

-- Criar tabela de tickets no schema ti
create table if not exists ti.tickets (
  id uuid primary key default gen_random_uuid(),
  numeric_id text not null,
  solicitante text not null,
  assunto text not null,
  categoria text not null,
  descricao text not null,
  anexo text,
  anexo_nome text,
  status text not null default 'aguardando',
  prioridade text,
  criado_em timestamptz not null,
  atribuido_em timestamptz,
  analista_id text,
  analista_nome text,
  resolucao text,
  resolvido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Criar índices para melhor performance
create index if not exists idx_tickets_status on ti.tickets(status);
create index if not exists idx_tickets_criado_em on ti.tickets(criado_em);
create index if not exists idx_tickets_analista_id on ti.tickets(analista_id);

-- Habilitar Row Level Security
alter table ti.tickets enable row level security;

-- Políticas RLS (permitir todas as operações para simplificar)
create policy "Permitir leitura de tickets"
  on ti.tickets for select
  using (true);

create policy "Permitir criação de tickets"
  on ti.tickets for insert
  with check (true);

create policy "Permitir atualização de tickets"
  on ti.tickets for update
  using (true);

create policy "Permitir deleção de tickets"
  on ti.tickets for delete
  using (true);

-- Função para atualizar updated_at automaticamente
create or replace function ti.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar updated_at
create trigger update_tickets_updated_at
  before update on ti.tickets
  for each row
  execute function ti.update_updated_at_column();
