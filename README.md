# Copa do Mundo FIFA 2026 - Álbum de Figurinhas

Aplicação web para o álbum de figurinhas da Copa do Mundo FIFA 2026, com troca de figurinhas, palpites e gerenciamento de partidas.

## Stack

- **Framework:** Next.js 16
- **Banco de dados:** PostgreSQL (Neon) + Prisma 7
- **Estilo:** Tailwind CSS 4
- **Testes:** Vitest
- **Deploy:** Vercel

## Funcionalidades

- Álbum de figurinhas interativo com 48 seleções e ~1256 jogadores
- Abertura de pacotes de figurinhas
- Sistema de troca entre usuários
- Palpites para partidas
- Painel admin para gerenciamento de tabela oficial
- Autenticação com JWT (jose) + cookies HttpOnly
- Google OAuth

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Gerar Prisma Client
npm run db:generate

# Push schema para o banco
npm run db:push

# Seed do banco (grupos, estádios, seleções + jogadores + partidas)
npm run db:seed

# Iniciar desenvolvimento
npm run dev
```

## Scripts

| Comando                     | Descrição                   |
| --------------------------- | --------------------------- |
| `npm run dev`               | Servidor de desenvolvimento |
| `npm run build`             | Build de produção           |
| `npm run start`             | Iniciar produção            |
| `npm run lint`              | ESLint                      |
| `npm run format`            | Prettier (formatação)       |
| `npm run format:check`      | Verificar formatação        |
| `npm test`                  | Rodar testes (Vitest)       |
| `npm run db:generate`       | Gerar Prisma Client         |
| `npm run db:push`           | Push schema para DB         |
| `npm run db:seed`           | Seed completo               |
| `npm run db:seed:jogadores` | Seed apenas jogadores       |
| `npm run db:seed:partidas`  | Seed apenas partidas        |
| `npm run db:seed:fotos`     | Seed fotos dos estádios     |
| `npm run db:seed:fisico`    | Seed dados físicos          |
| `npm run db:studio`         | Prisma Studio               |

## Estrutura

```
src/
  app/            # Rotas Next.js (App Router)
  components/     # Componentes React
  contexts/       # Context providers
  lib/            # Utilitários (auth, formatação, rate-limit)
  data/           # Dados estáticos (formato copa, países)
prisma/
  schema.prisma   # Schema do banco
  seed.ts         # Orchestrator de seed
  seed-base.ts    # Grupos, estádios, seleções
  seed-jogadores.ts
  seed-partidas.ts
  seed-estadios-fotos.ts
  seed-fisico-jogadores.ts
```

## Variáveis de Ambiente

| Variável               | Descrição                     |
| ---------------------- | ----------------------------- |
| `DATABASE_URL`         | URL de conexão PostgreSQL     |
| `JWT_SECRET`           | Segredo para assinatura JWT   |
| `GOOGLE_CLIENT_ID`     | Client ID do Google OAuth     |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth |
