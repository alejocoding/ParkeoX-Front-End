# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ParkeoxFront is the Angular 19 frontend for Parkeox, a parking-management platform. It talks to a backend expected at `http://localhost:8080`. The codebase is written in **Spanish** (identifiers, comments, UI text) — match that convention when adding code.

## Commands

```bash
npm start            # ng serve — dev server at http://localhost:4200
npm run build        # production build to dist/parkeox-front
npm run watch        # dev build with --watch
npm test             # run all unit tests (Karma + Jasmine, headless Chrome)
ng test --include='**/login.component.spec.ts'   # run a single spec file
```

There is no linter configured. The build defaults to the `production` configuration.

## Architecture

**Standalone-component app.** Bootstrapped in `src/main.ts` via `bootstrapApplication(AppComponent, appConfig)`. There is no root `AppModule`. Providers (router, HttpClient + interceptors) live in `src/app/app.config.ts`. Note: `features/admin/admin.module.ts` and `admin-routing.module.ts` are legacy/empty NgModule scaffolding and are **not** wired into the app — admin routing is defined directly in `app.routes.ts`.

**Layout-based routing** (`src/app/app.routes.ts`). Three layout components wrap child routes:
- `PublicLayoutComponent` — `''`, `services`, `contact` (marketing/public pages)
- `AuthLayoutComponent` — `login`, `register`
- `AdminLayoutComponent` — `admin/*` (`dashboard`, `tickets`), protected by `authGuard` with `data: { role: 'SUPERADMIN' }`

**Auth is JWT-in-localStorage.** No refresh flow.
- Login (`features/dashboard/Login/login.component.ts`) POSTs to `/auth/login`, stores the returned `token` via `AuthService.saveToken`, then routes by role (`SUPERADMIN` → `/admin/dashboard`, `USER` → `/home`).
- `AuthService` (`services/auth.service.ts`) decodes the JWT payload client-side with `atob` — read role via `getRol()` (checks both `rol` and `role` claims), plus `getNombre()`, `getcompany()`.
- `authGuard` (`guards/auth.guard.ts`) checks `isAuthenticated()` and matches the route's `data.role`; redirects to `/login` on failure.
- `authInterceptor` (`interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <token>` to every request **except** paths containing `/auth/login` or `/auth/register`.

**API services.** Each service hardcodes its backend URL as `http://localhost:8080/...` — there are **no Angular environment files**, so changing the backend host means editing each service. Backend endpoints are grouped by prefix:
- `/auth/*` — login/register
- `/basics/*` — users, company (`/basics/company/unique/:id`), tariffs (`/basics/tariff`)
- `/advanced/*` — tickets (`/advanced/ticket`)

Services and models are colocated per feature (e.g. `features/admin/tickets/service/`, `.../interface/`) except the shared ones under `src/app/services/`. Most service methods and models are typed as `any`.

**User feedback** uses SweetAlert2 (`Swal.fire`) directly in components/services rather than a wrapper.

## Directory layout

- `src/app/features/` — feature areas: `home`, `dashboard` (login/register/services/contacto), `admin` (dashboard/tickets)
- `src/app/layouts/` — the three shell components above
- `src/app/shared/components/` — reusable UI (navbar, footer, admin side-bar)
- `src/app/services/`, `guards/`, `interceptors/` — cross-cutting concerns
