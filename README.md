# Founder Pocket

**Type something you've noticed. See if there's a business in it.**

Observation-to-business engine for turning things people notice into business angles, proof checks, startup dossiers, MVP build briefs, and validation plans.

Founder Pocket keeps the front door simple. The user starts with an observation. Everything serious happens after the scan: business angles, proof checks, Founder Fit, validation work, dossiers, share modes, and exports.

Founder Pocket doesn't just analyse the idea. It analyses whether this is the right opportunity for you.

## Current Mode

The app runs fully in local/demo mode today:

- React, TypeScript, Vite, Tailwind CSS, React Router
- LocalStorage persistence
- Mock auth with guest, user, and admin roles
- Local analytics events
- Demo share links
- Deterministic generation/scoring fallback

The SaaS layer is scaffolded but not connected to a live database in this repo.

Supabase mode is supported when the browser build receives:

```env
VITE_APP_MODE=supabase
VITE_SUPABASE_URL=https://iuclrqbipbisixlkobee.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Do not put a direct Postgres connection string or any `service_role` key in frontend code.

## Product Flow

Observation -> Business Scan -> Business Angles -> Proof Check -> Startup Dossier -> Save/Edit/Share/Export.

The homepage should stay plain and human. Startup, investor, accelerator, dossier, scoring, and export language belongs after the scan.

## MVP Features

- Human-first observation input
- Optional Founder Lens input after the user starts the scan
- Business Scan with signal classification and Business Potential Score
- Founder-adapted business angle ranking
- Proof Check with adaptive validation questions
- Founder Fit Engine with archetype, behaviour mode, insight types, fit score, recommended path, and tone adaptation
- Founder psychology and founder-market fit sections
- Startup dossier generator
- Editable dossier sections
- Interactive validation tracker with notes and evidence links
- Dashboard workspace
- Admin dashboard fed by local analytics
- Demo share links with full, investor, builder, and accelerator modes
- Copy actions, JSON download, export-pack download, and browser print/save-as-PDF

## SaaS Foundation Added

- `prisma/schema.prisma` with production data model
- `server/` Express API scaffold
- Auth route structure
- User/founder profile route structure
- Observations, scans, angles, proof checks, dossiers, sections, validation, share links, exports, AI, analytics, and admin route structure
- Server-side AI provider shell
- Prompt templates in `server/prompts/`
- Frontend `apiClient` for every planned route
- Frontend `authService`, `analyticsService`, `aiClient`, `exportService`, and `founderFitService`
- `.env.example` and `server/.env.example`
- GitHub Actions CI for typecheck and build

## Local Setup

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

## Frontend Scripts

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## Local vs Production Mode

Local/demo mode is the default:

```env
VITE_APP_MODE=local
VITE_ENABLE_BACKEND=false
VITE_API_BASE_URL=http://localhost:8787/api
```

When `VITE_ENABLE_BACKEND=true`, frontend service clients are ready to call the backend API. Until the server is fully implemented, keep local mode on.

## Backend Setup

The backend scaffold lives in `server/`.

```bash
pnpm --dir server install
pnpm backend:dev
```

Backend environment:

```env
PORT=8787
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/founder_pocket
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
AI_PROVIDER=mock
AI_MODEL=mock-founder-pocket
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## Database

Prisma schema:

```bash
pnpm db:generate
pnpm db:migrate
```

Supabase SQL Editor setup, recommended for the hosted project:

1. Open Supabase Dashboard -> SQL Editor -> New Query.
2. Paste and run `supabase/sql-editor/01_tables.sql`.
3. Open another New Query, paste and run `supabase/sql-editor/02_indexes_triggers_rls.sql`.
4. Open another New Query, paste and run `supabase/sql-editor/03_policies_rpc.sql`.
5. Check Table Editor for the app tables.

If `02_indexes_triggers_rls.sql` says a relation/table does not exist, `01_tables.sql` did not run successfully from the top.

Supabase CLI option:

```bash
supabase login
supabase init
supabase link --project-ref iuclrqbipbisixlkobee
supabase db push
```

The Supabase SQL migration lives in `supabase/migrations/202606280001_founder_pocket_schema.sql`.
It creates the app tables, JSON payload columns for the current local-first object model, RLS policies, and public read policies for active share links.

Core models include:

- User
- FounderProfile
- Observation
- BusinessScan
- BusinessAngle
- ProofCheck
- ProofAnswer
- StartupDossier
- DossierSection
- ValidationTask
- ShareLink
- ShareView
- ExportRecord
- AnalyticsEvent
- AdminSetting
- AIJob

## AI Architecture

All future AI calls should run server-side through:

- `server/src/services/aiProvider.ts`
- `server/prompts/*`
- `/api/ai/*` routes

If no provider key exists, use mock/deterministic generation. Do not expose AI keys in the frontend.

Generation rules:

- Plain, grounded language
- No fake proof
- No guaranteed outcomes
- Always include missing proof
- Always include risks
- Always include a next action

## Deployment Notes

GitHub Pages:

- Production Vite build uses `/Founder-Pocket/` as base path.
- Built `assets/` files are committed at the repository root for Pages hosting.

Vercel/Netlify:

- Use `pnpm build`.
- Serve `dist`.
- Keep backend disabled unless deploying API separately.

Render/Railway/VPS backend:

- Deploy `server/`.
- Add Postgres.
- Set `DATABASE_URL`, `JWT_SECRET`, CORS origin, and AI provider variables.
- Run Prisma migrations before enabling production mode.

## Roadmap

- Replace route stubs with Prisma-backed controllers
- Add real JWT/session middleware
- Add password hashing and provider auth
- Add server-rendered PDF generation
- Add file uploads for validation evidence
- Add billing/workspaces
- Add production analytics aggregation
- Add backend-driven public share links

## Positioning

Founder Pocket does not promise acceptance or success. It helps turn a real observation into business angles, proof questions, founder-fit analysis, validation tasks, and a serious startup dossier worth improving.

Demo share links are stored locally. Real public links require backend storage.
