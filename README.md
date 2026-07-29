# Calendário

App de calendário mobile-first, tema escuro, com repetição inteligente de eventos,
busca, filtros, estatísticas e backup em JSON.

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
hospedagem estática (Vercel, Netlify, GitHub Pages, etc.).

## Dados

Os eventos e categorias ficam salvos no localStorage do navegador — ou seja,
continuam lá mesmo se você fechar a aba, mas são específicos daquele navegador/
dispositivo. Use o menu (ícone de lista) dentro do app para exportar/importar um
backup em JSON quando quiser levar seus dados para outro lugar.

## Stack

- React + Vite
- Tailwind CSS
- lucide-react (ícones)
