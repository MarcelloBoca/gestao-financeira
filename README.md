# Gestão Financeira Pessoal

Aplicação web para gerir despesas mensais, categorias, itens, comparação entre meses e recomendações financeiras.

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Configuração

Crie um ficheiro `.env.local` com:

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

Para produção, use PostgreSQL em Vercel:

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"
```

## Estrutura principal

- `src/app/(app)` — páginas principais da aplicação
- `src/components` — componentes reutilizáveis
- `src/lib` — serviços, Prisma e agente financeiro
- `prisma/schema.prisma` — modelo de dados
- `prisma/seed.ts` — dados iniciais

## Funcionalidades

- Gestão de categorias e itens
- Criação de meses de despesas
- Geração de listas a partir do mês anterior ou itens recorrentes
- Confirmação/remoção de itens
- Comparação entre meses
- Agente financeiro local com recomendações
