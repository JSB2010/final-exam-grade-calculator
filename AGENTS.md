# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router files live in `app/`; `app/page.tsx` and `app/calculator/page.tsx` render calculator screens while `app/layout.tsx` hosts providers and theming. Feature components sit in `components/` (with shadcn primitives in `components/ui`), shared hooks in `hooks/`, helpers in `lib/`, and core math, Canvas calls, and export logic inside `utils/`. Domain types live in `types/`, assets remain in `public/`, and Tailwind layers stay in `app/globals.css`. Worker handlers go in `functions/api/`, with Cloudflare configuration captured in `wrangler.toml`.

## Build, Test, and Development Commands
`npm run dev` starts the Turbopack dev server on `http://localhost:3000`; use `npm run dev:default` to compare behavior with the classic dev server. Run `npm run build` before `npm run start` or exporting to `out/` for deployment. `npm run lint` executes Next.js’ ESLint + TypeScript rules. `npx wrangler pages dev ./out` previews the static export that Cloudflare Pages will deliver.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation, double quotes, and the `@/` absolute import alias. Components are PascalCase, hooks camelCase, and props typed with interfaces from `types/`. Favor Tailwind classes with shadcn/ui primitives and the `cn` helper instead of bespoke CSS. Keep impure browser logic out of shared utilities so `utils/grade-math.ts` and similar files stay deterministic.

## Testing Guidelines
Automated tests are not yet configured, so linting and manual QA protect quality. Before pushing, run `npm run lint`, then verify key behaviors: entering grades, importing Canvas data (`utils/canvas-api.ts`), exporting PDF/JSON, and responsive layouts. Add React Testing Library specs beside their components (e.g., `components/__tests__/grade-calculator.test.tsx`) and place Playwright flows under `tests/e2e/`; name tests after the user action they guard.

## Commit & Pull Request Guidelines
Follow the existing Git history’s tone: short, capitalized, present-tense subject lines such as `Switch from pnpm to npm for package management`, focused on one change. Commits and PRs should outline motivation, list the commands you ran (`npm run build`, `npm run lint`), and flag config differences (`wrangler.toml`, environment variables like `NEXT_PUBLIC_CANVAS_PROXY_URL`). Include screenshots or clips for UI work and link issues when relevant.

## Security & Configuration Notes
Never commit Canvas tokens or user data; keep secrets in ignored `.env` files and inject them at runtime, pointing `NEXT_PUBLIC_CANVAS_PROXY_URL` to a trusted proxy instead of `/api/canvas/courses` when needed. Ensure `wrangler.toml` continues to target `out/`, and keep worker handlers stateless to satisfy Cloudflare Pages limits.
