# MR Review Queue

Uma fila de code review para dois times de desenvolvimento (**Turing** e **Asgard**), construída com Next.js 14, Vercel KV e Tailwind CSS.

## Funcionalidades

- **Fila pública** — visível para todos, sem autenticação. Mostra quem está sendo revisado agora, posição na fila, tempo de espera em tempo real, busca e filtros por time.
- **Painel admin** — protegido por senha. Permite adicionar MRs, reordenar via drag & drop, marcar como "revisando agora", mover para histórico (Done) ou remover.
- **Polling automático** a cada 30 segundos para manter a fila atualizada.
- **Histórico** de MRs revisados com horário de conclusão.

## Stack

- [Next.js 14](https://nextjs.org/) com App Router e TypeScript
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (Redis) para persistência
- [Tailwind CSS](https://tailwindcss.com/) para estilização
- [@dnd-kit](https://dndkit.com/) para drag & drop

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd mr-review-queue
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

#### Como criar o Vercel KV e obter as credenciais

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Na dashboard, vá em **Storage** → **Create Database** → escolha **KV**.
3. Dê um nome (ex: `mr-review-queue`) e clique em **Create**.
4. Na página do KV store, clique na aba **`.env.local`**.
5. Copie os valores de `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` e `KV_REST_API_READ_ONLY_TOKEN` para o seu `.env.local`.

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Como fazer deploy na Vercel

1. Faça push do código para um repositório GitHub.
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório.
3. Em **Environment Variables**, adicione todas as variáveis do `.env.local.example`:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
4. Conecte o KV store ao projeto: em **Storage** no dashboard do projeto, clique em **Connect Store** e selecione o KV que você criou.
5. Clique em **Deploy**. As variáveis do KV serão injetadas automaticamente.

---

## Como trocar a senha de admin

A senha fica em variáveis de ambiente:

- **`ADMIN_PASSWORD`** — usada no servidor para validar o header `x-admin-password` nas rotas de API (é o gate real de segurança).
- **`NEXT_PUBLIC_ADMIN_PASSWORD`** — usada no browser para validação local antes de chamar as APIs.

Para trocar a senha:

### Localmente
Edite o `.env.local`:
```
ADMIN_PASSWORD=nova-senha-aqui
NEXT_PUBLIC_ADMIN_PASSWORD=nova-senha-aqui
```

### Na Vercel
1. Vá em **Settings** → **Environment Variables** no seu projeto.
2. Edite `ADMIN_PASSWORD` e `NEXT_PUBLIC_ADMIN_PASSWORD` com a nova senha.
3. Faça um redeploy para que as mudanças entrem em vigor.

> **Importante:** Mantenha `ADMIN_PASSWORD` e `NEXT_PUBLIC_ADMIN_PASSWORD` sempre iguais. A validação no client (`NEXT_PUBLIC_*`) é apenas UX — o real gate de segurança é o header validado no servidor.

---

## Estrutura do projeto

```
/app
  /api
    /queue
      route.ts          ← GET, POST, PATCH
      /history
        route.ts        ← DELETE
  /components
    PublicQueue.tsx
    AdminPanel.tsx
    QueueItem.tsx
    AdminItem.tsx
    LockScreen.tsx
  page.tsx
  layout.tsx
  globals.css
/lib
  kv.ts                 ← helpers para ler/salvar no Vercel KV
  auth.ts               ← helper para validar x-admin-password
  types.ts              ← MRItem, HistoryItem
.env.local.example
```
