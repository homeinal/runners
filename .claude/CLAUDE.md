# 매달 (Maedal) - Project Rules

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4
- PostgreSQL (Neon) + Prisma ORM
- Design: Neobrutalism (bold borders, offset shadows, primary yellow #f9f506)

## Tailwind CSS v4 Syntax (CRITICAL)

This project uses **Tailwind CSS v4**. You MUST use the canonical v4 syntax.

### Required v4 Syntax

| OLD (v3 / bracket) | NEW (v4 canonical) |
|--------------------|--------------------|
| `shadow-[var(--custom)]` | `shadow-(--custom)` |
| `hover:shadow-[var(--custom)]` | `hover:shadow-(--custom)` |
| `translate-x-[1px]` | `translate-x-px` |
| `translate-y-[1px]` | `translate-y-px` |
| `translate-x-[2px]` | `translate-x-0.5` |
| `translate-y-[2px]` | `translate-y-0.5` |
| `translate-x-[4px]` | `translate-x-1` |
| `translate-y-[4px]` | `translate-y-1` |
| `bg-[#hex]` (for theme colors) | Use CSS variables: `bg-(--color-name)` |

### CSS Variable References
- Use `shadow-(--shadow-neobrutalism)` NOT `shadow-[var(--shadow-neobrutalism)]`
- Use `bg-(--color-name)` NOT `bg-[var(--color-name)]`
- Parentheses `()` for CSS variables, brackets `[]` only for arbitrary one-off values

### Design System Shadows
- `shadow-(--shadow-neobrutalism)` — standard offset shadow
- `shadow-(--shadow-neobrutalism-sm)` — small shadow
- `shadow-(--shadow-neobrutalism-hover)` — hover state shadow

## Next.js 15 Rules

- Route params are `Promise<>` types — always `await params` in route handlers
- Use `next/image` for all images (not CSS `backgroundImage`)
- Use `next/script` with `strategy="lazyOnload"` for third-party scripts
- Font loading via `next/font/google` (already configured)

## Prisma Enums

The schema uses snake_case enum names. Import with aliases:
```ts
import type { registration_status_enum as RegistrationStatus } from "@prisma/client";
```

## File Structure
- `src/app/` — Pages and API routes
- `src/components/ui/` — Primitive UI components (Card, Badge, Button, Icon)
- `src/components/layout/` — Header, Footer, ThemeProvider
- `src/components/features/` — Feature-specific components (races, schedule, urgent)
- `src/lib/` — Utilities (prisma, date, utils)
- `src/types/` — TypeScript type definitions
