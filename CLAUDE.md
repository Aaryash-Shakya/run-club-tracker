# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strava club activity tracker — backend fetches club activities from Strava via cron jobs, validates them against pace/distance thresholds, stores in MongoDB, and sends daily/weekly leaderboard summaries to Slack. Frontend is a Vue 3 SPA that displays leaderboards, runner profiles, and visualizations.

Monorepo with two independent packages (`backend/` and `frontend/`), each with their own `node_modules` and package manager.

## Commands

### Backend (`cd backend/`, uses yarn)

```bash
yarn dev            # Development server with hot reload (nodemon + tsx)
yarn build          # Clean + install + compile TypeScript
yarn start          # Run compiled app (node dist/app.js)
yarn lint           # ESLint check
yarn lint:fix       # ESLint auto-fix
yarn format         # Prettier format
yarn format:check   # Prettier check
```

No test framework is configured.

### Frontend (`cd frontend/`, uses npm)

```bash
npm run dev          # Start Vite dev server (hot reload)
npm run build        # Type check + build + copy netlify.toml to dist
npm run build:netlify # Netlify CI build (type check + vite build)
npm run type-check   # Vue-tsc type checking only
npm run lint         # ESLint with auto-fix
npm run format       # Prettier on src/
```

Pre-commit hooks run `lint-staged` then full `eslint` via Husky.

## Architecture

### Backend

**Stack**: TypeScript, Express 5, Mongoose, MongoDB

**Layered structure**: routes → controllers → services → repositories → models

- **Routes** (`backend/src/routes/`): Define endpoints under `/api/`. Slack routes require Bearer token auth.
- **Controllers** (`backend/src/controller/`): Request handling and response formatting. Standard response shape: `{status, message, data}`.
- **Services** (`backend/src/services/`): Business logic — activity validation, Strava API calls, Slack messaging, notification formatting.
- **Repositories** (`backend/src/repositories/`): MongoDB queries, aggregation pipelines.
- **Models** (`backend/src/models/`): Mongoose schemas — User, Activity, Challenge, Participant, Token.

**Cron jobs** (`backend/src/jobs/`):
- `strava.job.ts`: Every 30 min — syncs new activities from Strava, auto-creates users, validates activities.
- `notification.job.ts`: Daily at 8 AM NPT, weekly on Sundays — sends Slack leaderboard messages.

**Activity validation logic** (`backend/src/services/activity.service.ts`):
- Pace > maxRunPace AND distance < minWalkingDistance → invalid walk
- Pace ≤ maxRunPace AND distance < minRunningDistance → invalid run
- Thresholds come from the active Challenge document

### Frontend

**Stack**: Vue 3 + TypeScript, Vite, Tailwind CSS v4 (dark space theme). No centralized state management — components use Composition API with local `ref`/`computed`. Deployed on Netlify.

**API**: Direct `fetch` calls to `import.meta.env.VITE_API_BASE_URL` (defaults to `http://localhost:8000/api`). No HTTP client wrapper.

**Routes** (`frontend/src/router/index.ts`):
- `/` — Leaderboard (HomeView → LeaderboardTable, TopThreePodium)
- `/runners` — All runners list (RunnersView)
- `/runners/:runnerId/activities` — Individual runner details + distance chart (RunnerActivitiesView)
- `/rules` — Rules & reminders (RulesView)
- `/visualization` — Animated bar chart race (VisualizationView)

**Key directories**:
- `frontend/src/components/` — Reusable Vue components; `LeaderboardTable.vue` and `BarChartRace.vue` are the most complex
- `frontend/src/views/` — Page-level components mapped to routes
- `frontend/src/types/activity.d.ts` — All TypeScript types (`TActivity`, `TUser`, `TStats`, `TUserWithStats`, etc.)
- `frontend/src/constants/` — `global.constants.ts` (timezone: Asia/Kathmandu), `participant.constants.ts` (runner IDs)
- `frontend/src/utils/` — `pace.utils.ts` (pace calculation/formatting), `time.utils.ts` (seconds→HMS, UTC→Nepal time)

**Charts**: ECharts 6 via `echarts` package — used in `DistanceChart.vue` (line chart) and `BarChartRace.vue` (animated race).

## Key Conventions

- **Timezone**: All date operations use "Asia/Kathmandu" (UTC+5:45) via Luxon. Week boundaries are month-relative (week starts on the same weekday the month starts).
- **Validation**: Zod schemas in `backend/src/validations/`, applied via validation middleware.
- **Config**: Environment variables validated at startup via `envalid` in `backend/config/index.ts`. See `.env.example` for required vars.
- **Error handling**: `CustomError` class with HTTP status codes, global error handler middleware catches all.

## Code Style

### Backend
- Tabs, double quotes, 100 char width, trailing commas ES5 (see `backend/.prettierrc`)

### Frontend
- Tabs (width 4), no semicolons, single quotes, 100 char print width
- Tailwind CSS class sorting via Prettier plugin
- Path alias: `@` → `./src`
