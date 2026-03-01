## Phase: Audit

- [x] Complete full project audit of structure, tech stack, and major modules.
- [x] Identify performance, architecture, state management, Mongo schema, API, and UI/UX issues.

## Phase: Frontend

- [x] Remove unnecessary global auth store subscription from the app shell (`AppShell`).
- [x] Memoize the global `SupportChat` widget to avoid layout-driven re-renders.
- [x] Refactor `MainLayout` into smaller layout primitives and decouple news fetching from layout concerns.
- [-] Apply selector-based Zustand usage and memoization patterns across heavy views (e.g. Dashboard, Profile, Builder).
- [ ] Enhance route-level and component-level code splitting for heavy feature modules (Builder, Interview, Admin, analytics).
- [-] Refine the messaging page state usage and polling strategy for better performance and perceived real-time behavior.

## Phase: Backend

- [x] Normalize messaging read state by introducing a typed `readAt` field and appropriate indexing to align schema with controller usage.
- [x] Replace the N+1 messaging conversations query with a single aggregation pipeline for conversations, last message, and unread counts.
- [ ] Introduce a standardized request validation layer (e.g. Zod-based middleware) for all mutating endpoints.
- [ ] Optimize AI and other long-running endpoints with sensible timeouts, retry/backoff, and caching where appropriate.
- [ ] Review and add indexes for other hot collections (jobs, posts, notifications, resumes history) based on observed access patterns.
- [ ] Consider splitting lightweight public read routes onto a lighter middleware stack (reduced sessions/CSRF) where safe.

## Phase: UI/UX

- [x] Define a cohesive design system (colors, spacing scale, typography hierarchy, component primitives, motion) for the entire app.
- [ ] Implement the design system in shared UI components and replace ad-hoc Tailwind styling where appropriate.
- [ ] Clean up navigation and profile flows (remove duplicate Settings entries, clarify distinction between Profile vs Settings vs Premium).
- [ ] Deduplicate asset URL helpers such as `resolveAssetUrl` into a shared utility module.
- [ ] Strengthen page-level empty states, loading skeletons, and feedback patterns across Dashboard, Profile, Messaging, and Builder.

## Phase: Architecture

- [ ] Convert the repo to a simple workspace layout (e.g. `apps/frontend`, `apps/api`) with clear dependency and build boundaries.
- [ ] Split backend into domain-oriented modules with a service layer (e.g. `messages`, `dashboard`, `resumes`, `auth`) for better testability and scaling.
- [ ] Introduce frontend feature modules under `src/features/*` and keep `pages/*` as thin composition shells.
- [ ] Extract cross-cutting concerns (logging, error handling, auth/session helpers) into shared utilities usable by future workers/cron jobs.

## Summary

### Key performance risks

- Messaging frontend still relies on interval-based polling and broad store subscriptions, which can cause excessive re-renders and network load as usage grows.
- `MainLayout` remains a large, stateful “god component” tied to data fetching (news, auth, i18n), so its render cost grows with every new feature.
- Backend beyond messaging does not yet have systematic request validation and indexing for all hot paths, which can lead to slow or inconsistent API responses at scale.

### Highest-impact next task

- **Refine the messaging page state usage and polling strategy for better performance and scalability.**

