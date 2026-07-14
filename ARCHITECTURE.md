# Arquitetura do Projeto: Copa do Mundo FIFA

## Visão Geral

Este projeto é desenvolvido com as seguintes tecnologias principais:

- **Next.js (App Router)**: Framework React para roteamento e renderização Híbrida (SSR/SSG).
- **Prisma ORM**: Gerenciamento e modelagem do banco de dados (PostgreSQL).
- **PostgreSQL**: Banco de dados relacional hospedado (neon/vercel/etc).
- **Tailwind CSS**: Estilização via classes utilitárias e Design System.
- **Vitest**: Testes unitários para regras de segurança e domínio.

O projeto segue a filosofia de **Clean Architecture** e separação de responsabilidades (SoC), mantendo a lógica de negócios e persistência isolada da camada de apresentação (Frontend / Next.js Pages).

---

## Estrutura de Pastas (Tree)

```text
copa-do-mundo-fifa/
├── prisma/                    # Modelagem e Semeadura de Dados
│   ├── data/                  # Arrays brutos (JSON/TS) com dados do domínio
│   ├── migrations/            # Histórico de migrações do banco (SQL)
│   └── scripts/               # Scripts isolados de execução ou fetch de APIs externas
├── src/
│   ├── app/                   # Camada de Apresentação e Rotas (Next.js App Router)
│   │   ├── (main)/            # Grupo de rotas autenticadas e páginas principais
│   │   └── api/               # API Routes (Controllers) chamadas pelo frontend
│   ├── components/            # Componentes React isolados, de UI e estruturais
│   ├── contexts/              # Provedores de Contexto Global (ex: Theme, Auth)
│   ├── data/                  # Constantes e dicionários auxiliares
│   ├── generated/             # Tipagens e artefatos gerados automaticamente (ex: Prisma Client local)
│   ├── hooks/                 # Custom React Hooks para chamadas HTTP e estados locais
│   ├── lib/                   # Utilitários de infraestrutura (Prisma Singleton, Auth Core, Rate Limiter)
│   ├── services/              # Camada de Casos de Uso / Regras de Negócio (Album, Trocas, Palpites)
│   └── types/                 # Definições de Tipos Globais e Extensões do TypeScript
├── public/                    # Assets estáticos servidos diretamente pelo Next.js
└── __tests__/                 # Diretório de testes focado no backend e infra
```

---

## Mapeamento de Pastas e Arquivos (Responsabilidades)

### `src/app/` (Controllers & UI)

A camada mais externa da aplicação, servindo diretamente requisições HTTP e páginas.

- **`(main)/`**: Pasta de _Route Group_ do Next.js. Agrupa visualmente todas as páginas que compartilham o layout principal (Navbar, Sidebar). Aqui temos `tabela/`, `album/`, `trocas/`, etc. Não contém regras de negócio.
- **`api/`**: Responsável por receber dados do cliente (JSON via POST/PUT), validar a sessão do usuário chamando o `proxy.ts`, e repassar a execução para as funções da camada `services/`.

### `src/services/` (Casos de Uso)

O "Coração" do sistema. Todo acesso ao banco de dados e regras cruciais (como a trava de tempo dos jogos, cálculos de álbum) residem aqui.

- `album.service.ts`: Controla pacote diário, gacha system e limite.
- `palpite.service.ts`: Bloqueio por `dataHora` e upsert de palpites de usuários.
- `troca.service.ts`: Aceite, rejeição e processamento relacional entre doadores e recebedores.
- `partida.service.ts`: Helper para acesso a tabelas do mata-mata e grupos.

### `src/hooks/` (Presentation Logic)

Abstrai a lógica de chamadas (`fetch`) de componentes de UI. Substitui chamadas no-backend por Custom Hooks puros como `useFetch`, `useAuth`, `usePagination`.

### `src/components/` (Interface)

Blocos de construção visuais (Tailwind). Componentes burros (recebem `props` e disparam eventos) ou Smart Components que consomem Hooks (ex: `MataMataDesktop`).

### `src/lib/` (Infra e Utils)

Ferramentas independentes do contexto de negócio:

- `prisma.ts`: Conexão unificada do Banco.
- `rate-limit.ts`: Proteção contra DDoS e spam.
- `auth.ts`: Utilitário de assinatura JWT.

### `prisma/` (Data & Schema)

- `schema.prisma`: A Fonte da Verdade do modelo relacional (Tabelas).
- `data/`: Exportação pura dos jogadores e estádios para não poluir o executor.
- `seed.ts` e `scripts/`: Isolados para garantir que ao rodar `prisma db seed`, o banco sempre tenha um estado inicial conciso, integrando fotos e galerias perfeitamente com os dados brutos.

---

## Padrões Adotados (Design Patterns)

1. **Service Pattern:** Evitamos o _Anti-pattern_ de acessar banco de dados diretamente nos componentes do servidor (RSCs) do Next.js. Funções complexas são extraídas para `services/` permitindo reuso em `API Routes` ou `Server Actions`.
2. **Feature Flags / Separation of Concerns:** Rotas de API são adaptadores puros. Elas recebem o `Request`, extraem a autenticação e chamam o `service`.
3. **Singleton (Prisma):** Garantido pelo uso do `globalThis` em `src/lib/prisma.ts` para que hot-reloads no ambiente de desenvolvimento não estalem o limite de conexões do PostgreSQL.

---

## Mapeamento de Rotas

### 🌐 API Routes

| Método    | Caminho                            | Proteção      | Responsabilidade                 | Service / Origem     |
| --------- | ---------------------------------- | ------------- | -------------------------------- | -------------------- |
| POST      | `/api/auth/cadastro`               | Public        | Registro de usuário              | `prisma.user`        |
| POST      | `/api/auth/login`                  | Public        | Autenticação JWT                 | `auth.ts`            |
| POST      | `/api/auth/google`                 | Public        | Autenticação Social              | `auth.ts`            |
| GET       | `/api/auth/me`                     | `verifyAuth`  | Validação de sessão              | `prisma.user`        |
| GET/PATCH | `/api/admin/usuarios`              | `verifyAdmin` | Gerenciamento de usuários        | `prisma.user`        |
| POST      | `/api/admin/promover`              | `verifyAdmin` | Conceder cargo admin             | `prisma.user`        |
| GET/POST  | `/api/palpite`                     | `verifyAuth`  | Palpites Fase de Grupos          | `palpite.service.ts` |
| GET/POST  | `/api/palpites/mata-mata`          | `verifyAuth`  | Palpites Mata-Mata               | `palpite.service.ts` |
| GET       | `/api/palpite/ranking`             | Public        | Leaderboard Global               | `palpite.service.ts` |
| POST      | `/api/resultados-oficiais`         | `verifyAdmin` | Lançar placares reais            | `palpite.service.ts` |
| GET       | `/api/album`                       | `verifyAuth`  | Carregar álbum de figurinhas     | `album.service.ts`   |
| POST      | `/api/album/abrir-pacote`          | `verifyAuth`  | Gacha / Sorteio de figurinhas    | `album.service.ts`   |
| GET/POST  | `/api/trocas`                      | `verifyAuth`  | Listar / Iniciar troca           | `troca.service.ts`   |
| PATCH     | `/api/trocas/[id]`                 | `verifyAuth`  | Aceitar / Recusar troca          | `troca.service.ts`   |
| GET       | `/api/grupos`                      | Public        | Grupos da Copa                   | `prisma.grupo`       |
| GET       | `/api/estadios`                    | Public        | Catálogo de Estádios             | `prisma.estadio`     |
| GET       | `/api/estadios/[slug]`             | Public        | Detalhes do Estádio              | `prisma.estadio`     |
| GET       | `/api/partidas`                    | Public        | Lista de Jogos                   | `prisma.partida`     |
| PATCH     | `/api/partidas/[id]`               | `verifyAdmin` | Atualização de jogo (Admin)      | `partida.service.ts` |
| GET       | `/api/figurinhas`                  | Public        | Catálogo Base de Figurinhas      | `prisma.figurinha`   |
| GET       | `/api/figurinhas/repetidas`        | Public        | Usuários com repetições          | `prisma.figurinha`   |
| GET       | `/api/figurinhas/repetidas/[slug]` | Public        | Detalhes de repetição específica | `prisma.figurinha`   |
| GET       | `/api/usuarios/[slug]/repetidas`   | Public        | Estoque de troca de um usuário   | `prisma.figurinha`   |

### 🖥️ Frontend Pages

| Caminho                                    | Responsabilidade           | Dados Consumidos                   |
| ------------------------------------------ | -------------------------- | ---------------------------------- |
| `/(main)/page.tsx`                         | Home (Landing Page)        | Estático / Marketing               |
| `/(main)/tabela/page.tsx`                  | Classificação de Grupos    | `/api/grupos`                      |
| `/(main)/tabela/placar/page.tsx`           | Listagem de Jogos          | `/api/partidas`                    |
| `/(main)/tabela/mata-mata/page.tsx`        | Bracket / Chaveamento      | `/api/partidas`                    |
| `/(main)/tabela/ranking/page.tsx`          | Leaderboard Palpites       | `/api/palpite/ranking`             |
| `/(main)/album/page.tsx`                   | Álbum e Sorteio (Gacha)    | `/api/album`, `/api/figurinhas`    |
| `/(main)/trocas/page.tsx`                  | Caixa de Entrada de Trocas | `/api/trocas`                      |
| `/(main)/trocas/repetidas/[slug]/page.tsx` | Lista de doadores          | `/api/figurinhas/repetidas/[slug]` |
| `/(main)/trocas/nova/.../page.tsx`         | Montar Proposta            | `/api/usuarios/[slug]/repetidas`   |
| `/(main)/selecoes/page.tsx`                | Catálogo de Seleções       | `/api/selecoes`                    |
| `/(main)/selecoes/[slug]/page.tsx`         | Elenco e Info da Seleção   | `/api/selecoes/[slug]`             |
| `/(main)/estadios/page.tsx`                | Catálogo de Estádios       | `/api/estadios`                    |
| `/(main)/estadios/[slug]/page.tsx`         | Fotos e Info do Estádio    | `/api/estadios/[slug]`             |
| `/(main)/perfil/page.tsx`                  | Dashboard Pessoal          | `/api/auth/me`                     |
| `/(main)/perfil/[slug]/page.tsx`           | Perfil Público de usuário  | `/api/usuarios/[slug]`             |
| `/(main)/admin/page.tsx`                   | Dashboard Admin            | Múltiplos endpoints de admin       |
| `/(main)/admin/tabela/oficial/page.tsx`    | Editar Placar Real         | `/api/resultados-oficiais`         |
