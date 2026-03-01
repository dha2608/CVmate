## Design System — CV Mate

### 1. Foundations

#### 1.1 Color tokens

- **Brand**
  - `color.brand.primary`: `bg-crimson-red` / `text-crimson-red`
  - `color.brand.primaryStrong`: `bg-fire-red`
  - `color.brand.primarySoft`: `bg-red-50` / `bg-red-900/20` (soft backgrounds, chips)
- **Semantic**
  - `color.semantic.success`: `text-green-600` / `bg-green-50`
  - `color.semantic.warning`: `text-amber-600` / `bg-amber-50`
  - `color.semantic.error`: `text-red-600` / `bg-red-50`
  - `color.semantic.info`: `text-blue-600` / `bg-blue-50`
- **Neutrals (light)**
  - `color.neutral.bg`: `#F8F9FA` (`bg-[#F8F9FA]`)
  - `color.neutral.surface`: `bg-white`
  - `color.neutral.border`: `border-gray-200`
  - `color.neutral.text`: `text-slate-900`
  - `color.neutral.muted`: `text-gray-500`
- **Neutrals (dark)**
  - `color.neutral.bg.dark`: `bg-gray-900`
  - `color.neutral.surface.dark`: `bg-gray-800` / `bg-gray-900`
  - `color.neutral.border.dark`: `border-gray-700`
  - `color.neutral.text.dark`: `text-gray-100`
  - `color.neutral.muted.dark`: `text-gray-400`

#### 1.2 Spacing scale (4px base)

- `space.xs`: 4px (`gap-1`, `p-1`)
- `space.sm`: 8px (`gap-2`, `p-2`)
- `space.md`: 12px (`gap-3`)
- `space.lg`: 16px (`p-4`)
- `space.xl`: 20px (`p-5`)
- `space.2xl`: 24px (`p-6`)
- `space.3xl`: 32px (`p-8`)

Usage:

- Section padding: `space.2xl`–`space.3xl`
- Card padding: `space.lg`–`space.xl`
- Vertical gaps in stacks: `space.md`–`space.lg`

#### 1.3 Radius, shadows, motion

- **Radius**
  - `radius.sm`: `rounded-md`
  - `radius.md`: `rounded-lg`
  - `radius.lg`: `rounded-xl`
  - `radius.full`: `rounded-full`
- **Shadows**
  - `shadow.sm`: `shadow-sm` (default for most cards/buttons)
  - `shadow.md`: `shadow-md` (hover)
  - `shadow.lg`: `shadow-2xl` (key surfaces like resume preview)
- **Motion**
  - Standard transition: `transition-all duration-200 ease-out`
  - Emphasized hover: `duration-300 ease-out`
  - Micro-interactions: small `scale` and `translateY` via `framer-motion` for cards, CTAs.

#### 1.4 Typography

- **Font**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Scale (desktop)**
  - `text-display`: 28–32px, bold (page titles, hero)
  - `text-heading`: 18–20px, semibold (section headers)
  - `text-body`: 14–16px, regular (default copy)
  - `text-label`: 12–13px, medium (badges, helpers)
- **Line-height**
  - Body: `leading-6` for 16px
  - Headings: `leading-tight`

### 2. Component primitives

- **Button**
  - Central source: `components/ui/button.tsx` (`buttonVariants` with `variant` + `size`).
  - Standardize new buttons to use:
    - `variant="default"` for primary brand CTAs.
    - `variant="outline"` for secondary actions.
    - `variant="ghost"` for icon-only nav / subtle controls.
  - Avoid ad-hoc `bg-*/text-*` on raw `<button>`; wrap in `Button` or introduce new `buttonVariants` entries when needed.

- **Card**
  - Use `glass-card`, `GlassCard`, or a future `Card` primitive with:
    - `bg-white dark:bg-gray-800`
    - `border-gray-200 dark:border-gray-700`
    - `rounded-xl shadow-sm hover:shadow-md`

- **Inputs**
  - Use `components/ui/input.tsx` + `textarea.tsx` for all standard fields.
  - Uniform height (`h-10` / `h-11`), focus ring (`focus:ring-crimson-red` via Tailwind plugin or class), and radius (`rounded-md`).

- **Layout**
  - `MainLayout` as shell; per-page sections use max-width constraints:
    - Dashboard: `max-w-7xl mx-auto`
    - Profile/Builder: `max-w-5xl` or `max-w-[1920px]` for full-width experiences.

### 3. Mapping plan (refactors)

#### 3.1 Frontend pages/components

- **Dashboard**
  - Already uses `Button`, `GlassButton`, `GlassCard`, consistent gradients and motion.
  - Refactor remaining raw buttons/divs to reuse `Button` where feasible (e.g. search icon button, CTA chips).

- **Profile**
  - Use design tokens for:
    - Premium banner gradient (`from-crimson-red to-fire-red`).
    - Card surfaces (`bg-white/90 dark:bg-gray-800/90`, `border-gray-200/700`).
  - Replace any standalone button styles with `Button` variants.

- **Builder**
  - Top bar buttons (`Settings`, `Save`, `Download`) already mostly aligned with `Button`.
  - Ensure spacing and typography use the shared scale (e.g. replace one-off paddings with `space.*` equivalents in Tailwind classes).

#### 3.2 Global layout & navigation

- **MainLayout**
  - Keep navigation buttons using `NavItem` with consistent icon sizes and text styles.
  - Ensure profile dropdown buttons all use `Button variant="ghost"` with the same spacing and radius.
  - News sidebar already uses shared `Button` and color tokens; future tweaks should respect color and spacing tokens above.

### 4. Execution checklist

- [x] Define design tokens for color, spacing, radius, shadows, motion, and typography.
- [x] Align `Button` variants with brand tokens (`crimson-red`, `fire-red`, neutrals).
- [ ] Audit all pages for raw `<button>` elements and map them to `Button` (or add new `buttonVariants` entries where needed).
- [ ] Normalize card surfaces to a small set of card variants (`surface`, `surface-soft`, `surface-glass`) across Dashboard, Profile, Builder, Interview.
- [ ] Consolidate gradients and brand usages to avoid conflicting color schemes.
- [ ] Document usage examples per component (Button, Card, Input, Layout) and enforce them via code review / linting rules where possible.

