# Calendário

App de calendário mobile-first, tema escuro, com repetição inteligente de eventos,
busca, filtros, estatísticas e backup em JSON.

## Configurar o Supabase (obrigatório)

O app agora salva os dados na nuvem via Supabase, um por usuário (Karina,
Otavio e Teste). Antes de rodar:

1. Crie um projeto em https://supabase.com (grátis).
2. No seu projeto, vá em **SQL Editor**, cole o conteúdo de
   [`supabase/schema.sql`](./supabase/schema.sql) e rode. Isso cria a tabela
   `kahlendario_state` e já deixa uma linha pronta para cada um dos 3 usuários.
3. Vá em **Project Settings > API** e copie a **Project URL** e a
   **anon public key**.
4. Copie `.env.example` para `.env` e preencha:

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
   ```

> ⚠️ Este app não tem senha — a tela inicial só reconhece os 3 nomes fixos
> (Karina, Otavio, Teste). O `schema.sql` libera leitura/escrita da tabela
> para a chave anon, que é a mesma usada no front-end. Isso é adequado para
> um app pessoal/familiar, mas não é uma barreira de segurança de verdade:
> qualquer pessoa com a URL + anon key consegue ler/gravar os dados. Se
> precisar de mais proteção no futuro, dá para evoluir para Supabase Auth
> (com senha de verdade) sem mudar a estrutura da tabela.

## Como rodar

Pré-requisito: Node.js instalado (versão 18 ou mais recente) — https://nodejs.org

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente http://localhost:5173).

## Como gerar a versão de produção

```bash
npm run build
```

Os arquivos finais ficam na pasta `dist/`. Você pode subir essa pasta em qualquer
hospedagem estática (Vercel, Netlify, GitHub Pages, etc.) — lembre de configurar
as mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na hospedagem.

## Login e dados

A tela inicial pede um nome (ou um toque em um dos 3 botões): **Karina**,
**Otavio** ou **Teste**. Cada um tem sua própria agenda, isolada dos outros,
guardada na tabela `kahlendario_state` do Supabase — uma linha por usuário. O
app também guarda um cache local (localStorage) de cada usuário, usado como
fallback só-leitura se a internet cair. Use "Trocar usuário" no menu do app
para voltar à tela inicial. Exportar/importar backup em JSON continua
disponível no mesmo menu.

## Stack

- React + Vite
- Tailwind CSS
- lucide-react (ícones)
- Supabase (Postgres + API) para persistência dos dados
