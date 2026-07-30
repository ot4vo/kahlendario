-- Kahlendario: tabela que guarda os dados de cada um dos 3 usuários.
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists public.kahlendario_state (
  user_name  text primary key check (user_name in ('Karina', 'Otavio', 'Teste')),
  events     jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Garante que já existe uma linha para cada usuário (evita "not found" no
-- primeiro carregamento; o app também funciona sem isso, mas fica mais direto).
insert into public.kahlendario_state (user_name)
values ('Karina'), ('Otavio'), ('Teste')
on conflict (user_name) do nothing;

-- Row Level Security -------------------------------------------------
-- Este app não tem login "de verdade" (senha) — a tela inicial só escolhe
-- entre 3 nomes fixos. Por isso liberamos leitura/escrita para a chave
-- "anon" (a mesma usada no front-end). Ou seja: qualquer pessoa com a
-- URL + anon key do seu projeto consegue ler/gravar essa tabela.
-- Isso é aceitável para um app pessoal/familiar, mas não é uma barreira de
-- segurança real. Se quiser mais proteção, dá para trocar depois por
-- Supabase Auth (e-mail/senha) + policies por auth.uid().

alter table public.kahlendario_state enable row level security;

create policy "kahlendario anon select"
  on public.kahlendario_state for select
  to anon
  using (true);

create policy "kahlendario anon insert"
  on public.kahlendario_state for insert
  to anon
  with check (true);

create policy "kahlendario anon update"
  on public.kahlendario_state for update
  to anon
  using (true)
  with check (true);
