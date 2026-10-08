# Perfil de revisão deste repositório

Lido pela skill `pr-review-essentials` (`.claude/skills/pr-review-essentials/SKILL.md`) antes de
toda revisão. É o que muda de repo para repo; a skill em si é genérica e vem do
[review-gate](https://github.com/noharm-ai/review-gate).

## 1. Perfil de risco

- **Repositório público** (`noharm-ai/frontend`, licença open source). Tudo o que entra num commit
  — código, fixture, comentário, mensagem de commit, nota de review — é legível por qualquer
  pessoa na internet, para sempre. A régua para secret/infra leak é a **mais baixa possível**.
- É a SPA (React 19 + Vite) do produto clínico NoHarm, usada por farmacêuticos e equipes de
  hospitais clientes. Build estático publicado em S3 (`--acl public-read`) pelos workflows
  `deploy-*.yml`. **Tudo o que é `VITE_*` é embutido no bundle e é público**: não existe segredo
  no frontend. Valor sensível só pode viver em `secrets.*` do GitHub Actions, nunca no código.
- O app exibe PHI (pacientes, prescrições, exames, evoluções, culturas), mas não armazena: o dado
  vem do backend por schema de cliente (multi-tenant). O risco aqui é **dado real de paciente ou
  de cliente parar no repo** (fixture, gravação de mock, screenshot, comentário) e **XSS** em
  conteúdo vindo do backend/HIS (evoluções, laudos, artigos, notícias).
- Nome de hospital/cliente, schema de cliente, URL de API de ambiente, bucket, ARN, account ID ou
  e-mail real em arquivo versionado **é achado** (repo público).

## 2. Arquitetura e convenções

O `CLAUDE.md` descreve o projeto; o que conta como violação numa PR:

- **Código novo é TypeScript.** Arquivo novo em `src/` deve ser `.ts`/`.tsx` (incluindo
  `*.style.tsx` e slices). Criar `.js`/`.jsx` novo é achado. Editar um `.js`/`.jsx` legado
  existente não é — mas mover/reescrever um componente inteiro é a hora de convertê-lo, vale nota.
  `any` explícito, `@ts-ignore` e `@ts-nocheck` novos só com justificativa (o padrão aceito é o
  `@ts-ignore` comentado ao importar JS sem tipos, como em `src/pages/News/NewsPage.tsx`).
- **Padrão features.** Funcionalidade nova entra em `src/features/<domínio>/`:
  - Componente numa pasta com o nome dele e arquivo principal igual à pasta:
    `features/news/NewsPage/NewsPage.tsx` + `NewsPage.style.tsx`. **Nunca `index.tsx`.**
  - Estado em **slice Redux Toolkit** (`<Domínio>Slice.ts`, `createSlice` + `createAsyncThunk`
    com `rejectWithValue`), registrado em `src/store/ducks/index.ts`. Modelo: `NewsSlice.ts`,
    `CultureSlice.ts`, `KnowledgeBaseSlice.ts`.
  - Helpers/tipos do domínio como arquivos `.ts` soltos na pasta do domínio
    (`newsDate.ts`, `cultureTypes.ts`).
  - `src/pages/<Página>/` é só casca de rota (`withLayout(...)` em cima do componente da
    feature); lógica, estado e chamada de API em `pages/` é achado.
- **Não crescer o legado:** reducer novo em `store/ducks/` (reduxsauce), componente novo em
  `containers/` ou lógica de feature em `components/` (que é só UI compartilhada) é achado.
- **API:** chamada HTTP só via `services/` (`api.js` com namespace `api.<domínio>.*`, ou
  `services/admin|reports|regulation`). `axios`/`fetch` direto em componente ou slice para o
  backend é achado (pula `x-api-key`, refresh de token e `setHeaders`).
- **Named exports** sempre; `export default` novo é achado (exceto onde o legado consome
  default, ex.: reducers importados em `ducks/index.ts`).
- **Permissão:** UI gated por `PermissionService` / `models/Permission.js` e flags de
  `models/Feature.js`. Esconder botão não é controle de acesso — mas permissão nova sem
  contrapartida no backend merece pergunta.
- **i18n:** texto visível ao usuário via `t(...)`, com chave em `translations/pt.json` **e**
  `en.json`. String literal em PT/EN no JSX novo é achado leve.
- **Estilo:** Styled Components + antd 6; cores/tokens de `styles/theme.js`/`colors.js`.
- **`data-kb`:** blocos explicáveis e todo `page-header-title` novo levam `data-kb="<tela>.<bloco>"`.
  **Renomear ou remover um `data-kb` existente é achado** (quebra a ajuda fixada nele).
- **Testes:** feature nova ou mudança de fluxo vem com spec no suíte mockada
  (`tests/mocked/<área>/`) — ausência vale nota, não bloqueio.

## 3. Baseline aceito / falsos positivos conhecidos

- `VITE_APP_API_KEY` e demais `VITE_*` lidos via `import.meta.env` são públicos por design
  (vão no bundle). Não é achado ler essas variáveis; achado é **hardcodar** o valor delas.
- `.env` local (no `.gitignore`) carrega a config do dev; só `.env.sample` é versionado, com
  valores vazios/`localhost`/`example.com`. `.env` no diff **é** achado grave.
- Tokens em `localStorage` (`ac1`+`ac2`, `rt1`+`rt2`, via `utils/storage.ts`) são o mecanismo de
  auth aceito. Achado é token/credencial aparecendo em `console.*`, URL, query string ou log.
- Fixtures em `tests/mocked/fixtures/` e `tests/` com nomes fictícios (`Fulano Beltrano`,
  `Maria Teste`, `E2E Test`), e-mails `@example.com` e documentos claramente inválidos não são
  achado. **Nome/CPF/CNS/e-mail de pessoa real — inclusive de quem mantém o repo — é achado**
  (regra explícita do `CLAUDE.md`). `tests/mocked/fixtures/recorded/` é ignorado no git porque
  pode conter resposta real: arquivo dali no diff é achado grave.
- `localhost:5000/5001/3000` e as credenciais do banco de teste em `docker-compose.test.yml` /
  `docker/` são do ambiente E2E descartável — não é achado.
- `dangerouslySetInnerHTML` legado sem `DOMPurify` (ex.: `exams/ExamModal/table/TextualExams.jsx`)
  é dívida conhecida; não reportar de novo, mas **novo uso sem `DOMPurify.sanitize`** (ou sem
  passar por helper que sanitiza, como em `knowledgeBase`/`news`) é achado de segurança.
- Snapshots visuais em `tests/mocked/visual.antd.spec.ts-snapshots/` são por máquina e ignorados.

## 4. Áreas sensíveis

- `package.json` / `package-lock.json` — dependência nova deve vir pinada exata (`.npmrc` tem
  `save-exact=true`; `^`/`~` é achado), `overrides` mexidos, pacote com nome parecido com um
  conhecido.
- `.github/workflows/*` — action de terceiro sem SHA fixo, `npm ci`/`npm install` fora do `sfw`
  (Socket firewall) ou sem `--ignore-scripts`, `secrets.*` ecoado em log, permissão
  `contents: write` nova, mudança de bucket/ACL de deploy.
- `src/services/api.js`, `src/store/middlewares/autoRefreshToken*`, `src/store/refreshTokenManager.js`,
  `src/utils/storage.ts`, `src/lib/withAuth.jsx`, `src/services/PermissionService.js`,
  `src/models/Permission.js` — auth, token, headers, permissão.
- Qualquer `dangerouslySetInnerHTML`, `innerHTML`, `window.open`/`href` montado com dado do
  backend (XSS, `javascript:` URL).
- `vite.config.ts` (proxy, `define`, env exposto), `.env*`, `index.html` (script externo).
- `tests/mocked/fixtures/**`, `tests/**/*.json`, `docker/**` (SQL do banco E2E) — dado real de
  paciente/cliente.
