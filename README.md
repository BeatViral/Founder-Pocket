# Founder Pocket

**Type something you've noticed. See if there's a business in it.**

Observation-to-business engine for turning things people notice into business angles, proof checks, startup dossiers, MVP build briefs, and validation plans. Founder Pocket lets a user type a plain observation from work, life, customers, hobbies, health, music, education, local business, or the world around them, then scan it for business signals and decide what to test next.

## Features

- Human-first landing page with observation input
- Business Scan with signal classification and Business Potential Score
- 3-5 deterministic business angles per scan
- Proof Check with plain-language validation questions
- Startup Dossier generator with:
  - One-page business snapshot
  - Full startup dossier
  - Accelerator-style answers
  - Advisor FAQ
  - MVP build brief
  - Validation sprint
  - Founder video script
  - Outreach email
  - Data room checklist
  - Missing proof list
- Startup Readiness Score
- Dashboard for saved scans and dossiers
- Editable dossier sections
- Demo share links with full, investor, builder, and accelerator modes
- Copy actions and JSON download
- Browser print/save-as-PDF export
- LocalStorage persistence with service boundaries for a future backend

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- LocalStorage service adapter
- Mock deterministic generation and scoring services

## Local Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app is frontend-only and can deploy to Vercel, Netlify, or GitHub Pages.

GitHub Pages is currently compatible with branch-based Pages hosting. The production Vite build uses `/Founder-Pocket/` as its base path, and the built `assets/` files are committed at the repository root so `https://beatviral.github.io/Founder-Pocket/` can serve the app directly.

## Future Supabase Setup

The current app uses `src/services/storageService.ts`. A Supabase adapter can replace it without rewriting the UI.

Suggested tables:

- `users`
- `observations`
- `business_scans`
- `business_angles`
- `proof_answers`
- `startup_dossiers`
- `dossier_sections`
- `share_links`
- `validation_tasks`

## Future AI API Setup

The deterministic generation logic lives in `src/services/generationService.ts`, and scoring lives in `src/services/scoringService.ts`. A future AI service can replace or augment:

- `generateBusinessScan`
- `generateBusinessAngles`
- `generateStartupDossier`
- `generateAcceleratorAnswers`
- `generateBuildBrief`
- `generateValidationSprint`

Do not expose API keys in the frontend. Use serverless functions or a backend service for real AI calls.

## Roadmap

- Real auth
- Supabase persistence
- Server-side share links
- AI-assisted generation
- PDF rendering service
- Stripe billing
- Team workspaces
- Validation task updates that recalculate readiness

## Positioning

Founder Pocket does not promise funding, acceptance, or success. It helps turn a real observation into business angles, proof questions, and a serious startup dossier worth improving.

Demo share links are stored locally. Real public links require backend storage.
