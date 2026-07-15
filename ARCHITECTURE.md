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

| Caminho                                    | Responsabilidade             | Dados Consumidos                            |
| ------------------------------------------ | ---------------------------- | ------------------------------------------- |
| `/(main)/page.tsx`                         | Home (Landing Page)          | Estático / Marketing                        |
| `/(main)/tabela/grupos/page.tsx`           | Classificação de Grupos      | `/api/grupos`                               |
| `/(main)/tabela/placar/page.tsx`           | Listagem de Jogos            | `/api/partidas`                             |
| `/(main)/tabela/mata-mata/page.tsx`        | Bracket / Chaveamento        | `/api/partidas`                             |
| `/(main)/tabela/oficial/page.tsx`          | Resultados Oficiais Públicos | `/api/partidas`, `/api/resultados-oficiais` |
| `/(main)/palpites/bolao/page.tsx`          | Leaderboard Palpites         | `/api/palpite/ranking`                      |
| `/(main)/album/page.tsx`                   | Álbum e Sorteio (Gacha)      | `/api/album`, `/api/figurinhas`             |
| `/(main)/trocas/page.tsx`                  | Caixa de Entrada de Trocas   | `/api/trocas`                               |
| `/(main)/trocas/repetidas/[slug]/page.tsx` | Lista de doadores            | `/api/figurinhas/repetidas/[slug]`          |
| `/(main)/trocas/nova/.../page.tsx`         | Montar Proposta              | `/api/usuarios/[slug]/repetidas`            |
| `/(main)/selecoes/page.tsx`                | Catálogo de Seleções         | `/api/selecoes`                             |
| `/(main)/selecoes/[slug]/page.tsx`         | Elenco e Info da Seleção     | `/api/selecoes/[slug]`                      |
| `/(main)/estadios/page.tsx`                | Catálogo de Estádios         | `/api/estadios`                             |
| `/(main)/estadios/[slug]/page.tsx`         | Fotos e Info do Estádio      | `/api/estadios/[slug]`                      |
| `/(main)/perfil/page.tsx`                  | Dashboard Pessoal            | `/api/auth/me`                              |
| `/(main)/perfil/[slug]/page.tsx`           | Perfil Público de usuário    | `/api/usuarios/[slug]`                      |
| `/(main)/admin/page.tsx`                   | Dashboard Admin              | Múltiplos endpoints de admin                |
| `/(main)/admin/tabela/oficial/page.tsx`    | Editar Placar Real           | `/api/resultados-oficiais`                  |

---

## Fluxo Atual de Dados: Tabela e Mata-Mata

### Camada de UI (Frontend)

- **Placar de Grupos (`/tabela/placar/page.tsx`):** Os inputs de gol utilizam o evento `onBlur` para acionar a função `autoSalvar()`. Isso envia o novo placar (ou nulo, para limpar) como um payload JSON via `POST /api/palpite`.
- **Mata-Mata (`/tabela/mata-mata/page.tsx`):** O layout escuta mudanças nos inputs com um _debounce_ (via `setTimeout` de 800ms em `handleChange()`). Quando o usuário altera um placar ou pênalti de uma partida eliminatória, a UI envia silenciosamente um `POST /api/palpites/mata-mata`.

### Camada de API (Backend)

- **Rotas de Roteamento:** As APIs `/api/palpite` e `/api/palpites/mata-mata` recebem as requisições `POST`. Elas validam a autorização do usuário (via `extractUserIdFromRequest`), verificam o payload e passam para a camada de serviços.
- **Service (`src/services/palpite.service.ts`):** O serviço possui as funções `salvarPalpite` e `salvarPalpiteMataMata`. Elas conferem regras cruciais de domínio, por exemplo: _se a partida oficial já começou (baseado em `dataHora`), o sistema rejeita a alteração (lança exceção "O jogo já começou!")_.

### Persistência (Prisma)

- No banco de dados, a gravação ocorre de forma idempotente usando a função `prisma.palpite.upsert` e `prisma.palpiteMataMata.upsert`.
- Os dados não alteram a tabela global `Partida` em si (pois isso seria o resultado oficial real). Em vez disso, ficam salvos individualmente por usuário (`usuarioId_partidaId`) nas tabelas `Palpite` e `PalpiteMataMata`, isolando o estado da simulação de cada torcedor.

### Montagem do Chaveamento (Mata-Mata)

- A árvore do Mata-Mata é gerada 100% de forma reativa pelo **Frontend**!
- Em `carregar()`, a UI faz requisições paralelas (Promise.all) para `/api/grupos` (para saber o estado atual das seleções nos grupos) e `/api/palpites/mata-mata` (para ler os placares que o usuário preencheu na árvore).
- Esses dados são jogados na função de helper `computeBracket(formatoCopa, grupos, palpites)`. Essa função simula e resolve todo o torneio na hora, deduzindo os classificados dos grupos e injetando as Seleções automaticamente nas partidas subsequentes (ex: Oitavas -> Quartas) com base nos gols salvos.

---

## Fluxo Atual de Dados: Classificação Oficial e Admin

### Visão do Usuário (Tabela)

- **Interface:** O usuário visualiza a classificação real na página `/tabela/page.tsx`, que consome o endpoint `GET /api/grupos`.
- **Cálculo (Backend):** A API delega a lógica para `calcularClassificacao()` em `palpite.service.ts`. A pontuação de grupo (Vitórias, Empates, Derrotas, Saldo de Gols) é **calculada integralmente no backend**, baseando-se nas partidas da tabela `Partida` que possuem a _flag_ `encerrada: true`. Não há salvamento fixo de pontos para as seleções; tudo é derivado em tempo real a partir dos jogos encerrados.

### Visão do Admin (Lançamento)

- A tela oficial `/admin/tabela/oficial/page.tsx` permite ao Administrador preencher os resultados reais do torneio.
- **Fase de Grupos:** Ao preencher os gols, o formulário faz um `PATCH /api/partidas/[id]`. A rota chama `atualizarPartida` no serviço de `partida.service.ts`.
- **Fase Eliminatória (Mata-Mata):** Utiliza-se um endpoint separado: `POST /api/resultados-oficiais`, que é processado por `salvarResultadoOficial`.

### Persistência Oficial e Impacto no Sistema

- **Grupos (Verdade Absoluta):** As edições da fase de grupos alteram diretamente a tabela `Partida`, sobrescrevendo `golsMandante`, `golsVisitante`, atualizando `encerrada = true` e setando quem é o `vencedorId` (caso aplicável).
- **Mata-Mata (Verdade Absoluta):** Os jogos de mata-mata não alteram a `Partida` diretamente. Eles são salvos em uma tabela espelho separada chamada `ResultadoOficial`, que registra os pênaltis.
- **O Que Falta Acontecer (Gatilho de Pontos):** Atualmente, o serviço salva o resultado (real oficial), **mas não dispara um _trigger_ ou recálculo para pontuar os palpites dos usuários**. O sistema salva a Verdade Absoluta, mas os usuários ainda têm seus `pontos` como `null` ou desatualizados, já que falta uma lógica que cruze o palpite do usuário com o `ResultadoOficial` para atualizar a tabela `Palpite`!

## Engine de Transição de Fases (Admin)

Com base na auditoria da rota administrativa (`src/app/(main)/admin/tabela/oficial/page.tsx`), a engine de transição entre Fase de Grupos e Fase Eliminatória opera da seguinte forma:

- **Caminho do Service:** A lógica de transição **não** persiste os novos confrontos no banco de dados através de um serviço backend tradicional. A promoção das seleções ocorre de forma 100% dinâmica e em tempo real através da função de domínio `computeBracket` (localizada em `src/lib/compute-bracket.ts`).
- **Método de Persistência:** O sistema não cria novas linhas na tabela `Partida`, nem preenche colunas `mandanteId` ou `visitanteId` no banco para os jogos de mata-mata. As partidas da fase eliminatória já existem mapeadas (no formato da Copa) e os placares do mata-mata são gravados separadamente através de _Upserts_ na tabela-espelho `ResultadoOficial`.
- **Gatilho:** Não existe um endpoint dedicado como `/api/admin/promover`. O gatilho é puramente reativo: ao salvar um jogo da Fase de Grupos via `PATCH /api/partidas/[id]`, a API recalcula a classificação (`calcularClassificacaoGrupos`). O frontend consome essa nova tabela, executa o `computeBracket` localmente, deduz os classificados (incluindo a repescagem dos terceiros colocados) e monta a árvore de mata-mata automaticamente na tela do Admin. Ao lançar um placar do mata-mata, o Admin dispara um `POST /api/resultados-oficiais`.
- **Regras de Bloqueio:** Atualmente, **não** existe uma regra de negócio ou bloqueio no backend que impeça a transição ou o lançamento de resultados no mata-mata caso existam jogos da fase de grupos pendentes. A transição reflete a pontuação parcial.

## Engine de Apuração (Scoring System)

A lógica de distribuição de pontos do Bolão Oficial foi desenhada focando em separação de responsabilidades e integridade de dados.

- **Módulo Matemático (Função Pura):** A regra de negócio de pontuação reside em `calcularPontuacaoDaPartida` (`src/services/apurador.service.ts`). É uma função pura, totalmente desacoplada do banco de dados, o que a torna previsível e altamente testável (Unit Tests).
  - _Regras Tempo Normal:_ Acerto Exato (5 pts), Acerto de Vencedor + Saldo ou Empate Inexato (3 pts), Acerto Simples de Vencedor (1 pt).
  - _Bônus Mata-Mata:_ Acerto do Classificado nos Pênaltis (+2 pts) e Placar Exato dos Pênaltis (+1 pt).
- **Processamento e Persistência:** A consolidação dos pontos não ocorre de forma passiva (automática a cada gol). Ela é controlada ativamente pelo Administrador através de um gatilho manual (`POST /api/admin/apurar`).
  - O serviço busca todos os palpites ligados à partida informada, aplica a função pura e realiza a gravação em lote utilizando `prisma.$transaction`.
  - O uso de transações garante a atomicidade: se o servidor falhar durante o processamento de centenas de palpites, um _rollback_ é acionado, prevenindo que o ranking fique inconsistente.
- **Tipagem Estrita e Guardas de Tipo:** Como a engine lida com duas fases distintas do torneio na mesma visualização de tabela, a tipagem de confrontos indefinidos (Mata-Mata) exige que `selecaoMandanteId` e `selecaoVisitanteId` aceitem `null`. A engine de grupos implementa _Type Guards_ (`if (partida.selecaoMandanteId === null) continue;`), instruindo o compilador a descartar cenários de indefinição durante o cálculo da classificação de grupos.
- **Agregação de Ranking:** O Leaderboard (`/palpites/bolao/ranking`) realiza um `Promise.all` para ler e somar os valores das colunas `pontos` das tabelas separadas `Palpite` e `PalpiteMataMata`, consolidando a pontuação global em tempo real na memória.

## Ecossistema: Álbum de Figurinhas e Trocas

O sistema de figurinhas atua como um metagame (Gacha) paralelo ao Bolão, focado em coleção e negociação P2P.

- **Modelagem de Dados (Inventário):** A relação N:M entre Usuário e Figurinha é tratada através da tabela pivot `AlbumFigurinha`, que armazena a `quantidade`. Isso determina de forma simples que uma figurinha repetida é caracterizada por `quantidade >= 2`, e a aquisição de novas figurinhas apenas incrementa esse contador. O modelo `Troca` contém referências para `remetenteId`, `destinatarioId`, `figurinhaDesejadaId`, e se relaciona 1:N com `TrocaFigurinhaOferecida`.
- **Motor do Gacha (Pacote Diário):** O fluxo central (`src/services/album.service.ts`) controla a limitação diária de pacotes (`LIMITE_DIARIO = 10` pacotes de `4` figurinhas). O serviço verifica os campos `ultimoDiaAbertura` e `pacotesAbertosHoje` no registro do `User`. O sorteio é executado através de uma query de performance via `prisma.$queryRawUnsafe("SELECT id FROM figurinhas ORDER BY RANDOM() LIMIT $1")`. A gravação no inventário e a atualização do relógio do usuário ocorrem estritamente dentro de uma transação atômica (`prisma.$transaction`) com `upsert`.
- **Máquina de Estados de Troca:** O ciclo de vida da negociação (`src/services/troca.service.ts`) transita entre os status de `pendente`, `aceita`, e `recusada` no modelo `Troca`.
  - _Validação Antecipada:_ Na criação da proposta, o backend valida se o remetente realmente possui duplicatas (`quantidade >= 2`) das cartas oferecidas e não possui a desejada.
  - _Liquidação (Settlement):_ Ao `responderTroca` como "aceitar", uma transação atômica massiva aplica uma cascata de `decrement` e `upsert` no inventário (`AlbumFigurinha`) de ambos os usuários, debitando e creditando as cartas trocadas simultaneamente. Se as quantidades mudaram no meio tempo, a transação reverte com erro e a troca é recusada por segurança.
- **Fluxo Operacional de UI:**
  - `/album/page.tsx`: Interface visual de abertura (Gacha), que realiza o fetch do pacote via API e aciona as animações de cartas, além de exibir a grade de figurinhas agrupadas por seleções.
  - `/trocas/page.tsx` (e rotas filhas): Gestão da caixa de entrada, permitindo o administrador das propostas (recebidas e enviadas) e a construção de novas propostas (exploração de repetidas da comunidade).

## Ecossistema: Perfil Público e Vitrine P2P

O sistema fomenta o aspecto social do Bolão, permitindo que os usuários acessem os perfis uns dos outros para propor negociações diretas.

- **Visão Pública e Privacidade:** A API de fornecimento (`/api/usuarios/[slug]/repetidas/route.ts` e afins) atua como um DTO sanitizador. O Prisma é instruído via `select: { id: true, nome: true, slug: true }` a não propagar dados sensíveis como `senha`, `email` ou histórico administrativo do usuário.
- **Motor da Vitrine:** O acesso público ao inventário de um usuário é estritamente limitado à visualização de sua Vitrine de Trocas. O backend aplica um filtro de domínio (`quantidade: { gte: 2 }`), impedindo que outros usuários visualizem as cartas únicas (coleção pessoal intransferível) do alvo.
- **Funil de Negociação (UX/UI):** A jornada P2P foi construída focada em fricção zero:
  - **1. Descoberta:** Ao navegar pelo perfil público de um adversário (`/perfil/[slug]`), o usuário pode visualizar todas as repetidas e clicar em "Solicitar Troca".
  - **2. Montagem da Oferta:** O usuário é levado à rota especializada `/trocas/nova/[slug]/[figurinhaId]`. A tela paraleliza _fetches_ para obter a carta desejada do alvo e o inventário pessoal (`minhasRepetidas`) do visitante logado.
  - **3. Disparo (Checkout):** O visitante seleciona no mínimo 1 figurinha própria para oferecer e dispara um `POST /api/trocas`, finalizando o funil de P2P e repassando o fluxo para a Máquina de Estados (gerando status `PENDENTE` para o alvo).

## Registro de Alterações (14-15/07/2026)

- **Correção de Persistência (IDs):** Ajuste na estratégia de auto-incremento de IDs de partidas para separar logicamente o domínio de Grupos do domínio de Mata-Mata.
- **Isolamento de Domínio:** Migração das rotas de testes para namespace `simulacao-*` para garantir conformidade com o Bolão Oficial.
- **Motor de Pênaltis:** Implementação de lógica condicional no `PlacarCard` para exibição dinâmica de inputs de pênaltis baseada na paridade de gols em partidas de Mata-Mata.
- **Renderização de Fases Avançadas:** Refatoração do componente de exibição para suportar estados de equipes indefinidas (`A definir`) em partidas de semifinal e final.

## Fluxo de Semeadura (Seed Process)

- **Ordem de Execução:** O processo de seed segue uma dependência relacional estrita: (1) Entidades base (Estádios, Seleções), (2) Estruturas de competição (Grupos), (3) Agendas (Partidas).
- **Gerenciamento de Dados:** Os dados brutos estão centralizados em `prisma/data/`, permitindo edições fora do código executável.
- **Idempotência:** Os scripts de seed utilizam `prisma.upsert` para garantir que a execução múltipla não crie registros duplicados ou quebre as chaves primárias (UUIDs).
- **Script de Execução:** O comando padrão é `npx prisma db seed`.

## Fluxo Operacional: /admin/tabela/oficial

- **Renderização:** A página consome o estado atual da competição via endpoint de listagem, renderizando cards de edição para cada partida, com estados distintos para Grupos (Editáveis) e Mata-Mata (Restritos à definição oficial).
- **Ciclo de Vida de Escrita:**
  - **Fase de Grupos:** O salvamento ocorre via `PATCH`, atualizando diretamente a entidade `Partida` no banco, disparando o cálculo reativo de classificação via `computeBracket`.
  - **Fase Mata-Mata:** O salvamento ocorre via `POST /api/resultados-oficiais`, populando a tabela espelho `ResultadoOficial`, isolada da entidade de partida para auditoria.
- **Dependências de Arquivos:** Principais arquivos no fluxo: `page.tsx` (UI), `partida.service.ts` (lógica de atualização), `ResultadoOficial` (tabela de persistência).

## Fluxo Operacional: /tabela (Hub Central)

- **Visão Geral:** A rota original `/tabela` atua como hub lógico (Dropdown Menu). Ela agora redireciona visualmente as navegações diretas para `/tabela/grupos` e `/tabela/oficial`.
- **Renderização e Consumo:** Centraliza as exibições da fase de grupos e dos resultados consolidados da copa.
- **Responsabilidade:** Garantir a separação entre simulações/bolão (estado isolado) e a exibição oficial (estado read-only ou estático).
- **Arquivos Envolvidos:**
  - `src/app/(main)/tabela/grupos/page.tsx` (Grade Original de Grupos)
  - `src/app/(main)/tabela/oficial/page.tsx` (Grade de Resultados ReadOnly)
  - `src/services/partida.service.ts` (Fornecedor de dados para as tabelas)

## Fluxo Operacional: /tabela/oficial (ReadOnly)

- **Descrição:** View pública de resultados consolidados. Reutiliza componentes de edição do Admin, mas com a flag `isAdmin={false}` para remover qualquer interatividade de escrita ou inputs de formulário.
- **Arquivos:** `src/app/(main)/tabela/oficial/page.tsx`.

## Fluxo Operacional: /tabela/simulacao-grupos

- **Visão Geral:** Ambiente de sandbox (playground) para testes de cenários. Totalmente desacoplado do Bolão Oficial.
- **Processamento:** A renderização consome o estado base via `GET /api/simulacao`. As alterações de placar disparam salvamentos locais via `PATCH` ou `POST` direcionados para o serviço de simulação.
- **Isolamento de Dados:** O sistema garante que nenhum palpite ou resultado gerado aqui interfira na tabela `Palpite` (usuário) ou `ResultadoOficial` (admin). O estado é persistido em tabelas exclusivas de simulação.
- **Arquivos Envolvidos:**
  - `src/app/(main)/tabela/simulacao-grupos/page.tsx` (UI do Simulador)
  - `src/services/simulacao.service.ts` (Regras de negócio isoladas)
  - `src/app/api/simulacao/**` (Endpoints de simulação)

## Fluxo Operacional: /tabela/simulacao-mata-mata

- **Visão Geral:** Ambiente de sandbox avançado para simulação de chaveamentos eliminatórios.
- **Renderização Dinâmica:** A árvore de confrontos é montada reativamente no cliente. A página lê os resultados de grupos simulados e utiliza lógica de domínio para calcular os próximos confrontos, permitindo ao usuário testar diferentes 'caminhos' até a final.
- **Isolamento de Persistência:** Dados de placares e pênaltis salvos aqui são armazenados exclusivamente nas tabelas de simulação. Isso assegura que o ambiente de teste nunca colida com o fluxo oficial de palpites ou com a verdade oficial do torneio.
- **Arquivos Envolvidos:**
  - `src/app/(main)/tabela/simulacao-mata-mata/page.tsx` (Interface do Chaveamento)
  - `src/services/simulacao.service.ts` (Persistência isolada)
  - `src/lib/compute-bracket.ts` (Lógica de montagem da árvore)

## Mapeamento Estrutural e Grafo de Dependências

| Camada / Arquivo         | Responsabilidade      | Depende de         | É Dependido por       | Motivo da Dependência                            |
| :----------------------- | :-------------------- | :----------------- | :-------------------- | :----------------------------------------------- |
| `lib/prisma.ts`          | Conexão Única com BD  | -                  | Todos os `services`   | Singleton para evitar estouro de pools.          |
| `services/*.service.ts`  | Regras de Negócio     | `lib/prisma.ts`    | `api/` routes         | Centralizar regra e isolar DB da UI.             |
| `app/api/`               | Adaptadores REST      | `services/`        | `hooks/`              | Separar request/response da lógica.              |
| `components/`            | Interface (UI)        | `types/`           | `app/pages`           | Modularização de visual (Tailwind).              |
| `lib/compute-bracket.ts` | Lógica de Chaveamento | -                  | `simulacao-mata-mata` | Abstrair cálculo complexo da UI.                 |
| `/tabela/grupos`         | Visualização Grupos   | `palpite.service`  | UI / Next.js          | Exibir classificação atualizada.                 |
| `/tabela/oficial`        | Resultados Oficiais   | `ResultadoOficial` | UI / Next.js          | Acesso público à verdade oficial.                |
| `apurador.service.ts`    | Cálculo de Pontos     | Função Pura (Math) | `api/admin/apurar`    | Isolar regra de pontuação do DB (SoC).           |
| `/admin/tabela/oficial`  | Gatilho de Apuração   | `apurador.service` | UI / Next.js          | Controle de distribuição de pontos.              |
| `album.service.ts`       | Motor Gacha e Limites | Função Pura / DB   | `/album`              | Controle de limite diário e sorteio aleatório.   |
| `troca.service.ts`       | Transações Atômicas   | DB                 | `/trocas`             | Máquina de estados de inventário entre usuários. |
| `/album`                 | UI do Gacha           | `album.service`    | UI / Next.js          | Visualização do álbum e animação de abertura.    |
| `/trocas`                | Gestão de Propostas   | `troca.service`    | UI / Next.js          | Caixa de entrada de negociações de cartas.       |
| `/perfil/[slug]`         | Vitrine Pública       | API de Usuários    | UI / Next.js          | Exibição sanitizada e acesso às repetidas.       |
| `/trocas/nova/...`       | Funil de Troca (P2P)  | API de Trocas      | UI / Next.js          | Orquestração visual da montagem de proposta.     |

### Pontos de Ruptura (God Objects)

- **Ponto Crítico:** `src/lib/prisma.ts` é o ponto de maior impacto. Qualquer alteração no schema reflete em todo o sistema.
- **Isolamento:** A camada `src/services/` protege a camada de persistência de mudanças abruptas na UI, atuando como um buffer de validação.
