# Design System — Modern Premium Financial Dashboard

Reference points: Stripe Dashboard (calm neutrals, restrained accent, data-first density),
Linear (typographic precision, motion discipline), Mercury / Ramp (premium fintech surfaces,
tabular numerics), Vercel (dark-mode contrast model), Radix + shadcn (accessible primitives).

Non-negotiables:
- No inline styles. Every value comes from a token or a component variant.
- No hardcoded business data. All content arrives via props, loaders, or query hooks.
- No duplicated UI components. One implementation per component, extended via variants.

---

## 1. Foundations

### 1.1 Color tokens

Colors are defined in `src/styles.css` as `oklch` custom properties on `:root` and `.dark`,
mapped into Tailwind through `@theme inline`. Components only ever use semantic names
(`bg-background`, `text-muted-foreground`, `bg-primary`) — never raw hex or `text-white`.

| Token | Role |
| --- | --- |
| `--background` / `--foreground` | App canvas and default text |
| `--card` / `--card-foreground` | Elevated surfaces, panels, tables |
| `--popover` / `--popover-foreground` | Menus, dropdowns, tooltips |
| `--primary` / `--primary-foreground` | Primary action, key emphasis |
| `--secondary` / `--secondary-foreground` | Secondary action, quiet fills |
| `--muted` / `--muted-foreground` | Row stripes, labels, metadata |
| `--accent` / `--accent-foreground` | Hover states, selected rows |
| `--destructive` / `--destructive-foreground` | Destructive action, hard failure |
| `--success` / `--success-foreground` | Gains, settled, positive delta |
| `--warning` / `--warning-foreground` | Pending, review required |
| `--info` / `--info-foreground` | Neutral system notices |
| `--border` / `--input` / `--ring` | Hairlines, field borders, focus ring |
| `--chart-1` … `--chart-5` | Series colors, ordered by priority |
| `--sidebar-*` | Sidebar surface, foreground, accent, border |

Proposed palette (light / dark):

```
--background      oklch(0.994 0.002 250)   /  oklch(0.155 0.015 260)
--foreground      oklch(0.205 0.020 260)   /  oklch(0.965 0.004 250)
--card            oklch(1 0 0)             /  oklch(0.195 0.017 260)
--primary         oklch(0.545 0.155 258)   /  oklch(0.680 0.150 258)
--success         oklch(0.610 0.145 158)   /  oklch(0.700 0.140 158)
--warning         oklch(0.760 0.140 78)    /  oklch(0.800 0.135 78)
--destructive     oklch(0.580 0.215 25)    /  oklch(0.680 0.190 25)
--border          oklch(0.925 0.008 258)   /  oklch(1 0 0 / 10%)
```

Financial semantics: positive values use `--success`, negative use `--destructive`,
neutral/zero uses `--muted-foreground`. Never encode meaning with color alone — pair with
sign, arrow glyph, or label.

Theme: light and dark are equal-priority. Dark mode is class-based (`.dark` on `<html>`),
persisted, defaulting to `prefers-color-scheme`. Both themes must pass WCAG AA (4.5:1 body,
3:1 large text and UI edges).

### 1.2 Typography

Two families, both loaded via `<link>` in `src/routes/__root.tsx`:

- Display / UI: **Geist** (fallback: Inter, system-ui)
- Numeric: same family with `font-variant-numeric: tabular-nums` — mandatory for every
  currency, percentage, and identifier so columns align.

Tokens: `--font-sans`, `--font-mono`, plus a fixed scale.

| Role | Size / line-height | Weight | Tracking |
| --- | --- | --- | --- |
| Display | 40 / 44 | 600 | -0.02em |
| H1 page title | 30 / 36 | 600 | -0.02em |
| H2 section | 24 / 32 | 600 | -0.015em |
| H3 card title | 18 / 26 | 600 | -0.01em |
| Body | 14 / 22 | 400 | 0 |
| Body strong | 14 / 22 | 500 | 0 |
| Metric value | 32 / 36 | 600 tabular | -0.02em |
| Label / caption | 12 / 16 | 500 | 0.01em |
| Overline | 11 / 14 | 600 uppercase | 0.08em |

One `h1` per route. Headings are semantic, never chosen for size.

### 1.3 Spacing

4px base, exposed as `--space-1` … `--space-16` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
Rules: 8 inside compact controls, 16 inside cards, 24 between cards, 32–48 between page
sections. Page gutters: 16 mobile, 24 tablet, 32 desktop. Max content width 1440px.

### 1.4 Radius

`--radius: 0.625rem` drives `--radius-sm` (6) → `--radius-4xl`. Inputs and buttons `md`,
cards and modals `xl`, pills fully rounded, chart tooltips `md`.

### 1.5 Shadows

Elevation is scarce — surfaces separate by border first, shadow second.

```
--shadow-xs   0 1px 2px  oklch(0.2 0.02 260 / 0.05)
--shadow-sm   0 1px 3px  oklch(0.2 0.02 260 / 0.08), 0 1px 2px -1px …
--shadow-md   0 4px 12px oklch(0.2 0.02 260 / 0.08)
--shadow-lg   0 12px 32px oklch(0.2 0.02 260 / 0.12)
--shadow-ring 0 0 0 3px  color-mix(in oklab, var(--ring) 35%, transparent)
```

Levels: page `none` → card `xs` → dropdown/popover `md` → modal/toast `lg`.
In dark mode shadows soften and borders carry more of the separation.

### 1.6 Motion

```
--ease-out    cubic-bezier(0.22, 1, 0.36, 1)
--ease-in-out cubic-bezier(0.65, 0, 0.35, 1)
--dur-fast    120ms   (hover, focus, color)
--dur-base    180ms   (dropdown, toast, tab)
--dur-slow    240ms   (modal, drawer, sidebar)
```

Only `opacity` and `transform` animate. Modal: fade + 4px rise + 0.98→1 scale. Toast: slide
from edge. Skeletons: 1.4s shimmer. Number changes tween ≤400ms. All motion collapses under
`prefers-reduced-motion: reduce`.

---

## 2. Layout

```text
Desktop ≥1024px                        Mobile <768px
┌──────┬──────────────────────────┐    ┌──────────────────────┐
│      │  Navbar (sticky, 56px)   │    │ Navbar + menu button │
│ Side ├──────────────────────────┤    ├──────────────────────┤
│ bar  │  Page header + actions   │    │ Page header          │
│ 260  ├──────────────────────────┤    │ Metric cards (stack) │
│ px   │  Metric row (4 cards)    │    │ Chart (full width)   │
│      │  Chart 8col │ List 4col  │    │ Table → card list    │
│      │  Table (full width)      │    │                      │
└──────┴──────────────────────────┘    └──────────────────────┘
```

Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.
Sidebar: expanded 260px, collapsed 72px (icons + tooltips), off-canvas sheet below `lg`.
Grid: 12 columns desktop, 6 tablet, 4 mobile; gap 24 / 20 / 16.
Tables below `md` become stacked cards with label–value rows; horizontal scroll is a
fallback only for dense financial ledgers, with the first column pinned.

---

## 3. Components

Each is a single source file with variants (CVA), no per-page copies.

**Button** — variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
Sizes: `sm` 32, `md` 36, `lg` 40, `icon` square. States: hover, active (translate-y-px),
focus-visible ring, disabled 50% + `not-allowed`, loading (spinner replaces leading icon,
label stays, width locked). Icon-only requires `aria-label`.

**Card** — `card` surface, `xs` shadow, `xl` radius, hairline border. Slots: header
(title, description, action), content, footer. Variants: `default`, `metric` (overline label,
metric value, delta chip), `interactive` (hover lifts to `sm`).

**Input** — 36px, `md` radius, `--input` border, focus ring, optional leading/trailing
adornments (currency symbol, unit). States: default, focus, error (`destructive` border +
message with `aria-describedby`), disabled, read-only. Companions: Textarea, NumberInput
(tabular), SearchInput, DateRangePicker — all sharing the same field shell.

**Select** — Radix-based, matching input shell, `popover` surface with `md` shadow, checkmark
on selected, keyboard type-ahead, grouped options with sticky group labels, async/searchable
variant, `--dur-base` fade.

**Modal** — Radix Dialog. Overlay `foreground/50` with backdrop blur, panel `card` surface,
`lg` shadow, widths `sm` 400 / `md` 560 / `lg` 720. Header (title + close), scrollable body,
footer with right-aligned actions. Focus trap, `Esc` to close, scroll lock, focus restored.
Below `sm` renders as a bottom sheet. Confirm-destructive variant reuses the same component.

**Table** — `card`-wrapped, sticky header, 44px rows (`compact` 36), `muted/40` hover,
`accent` selected, numeric columns right-aligned + tabular. Features: sortable headers with
direction icon, column visibility, row selection, sticky first column, pagination footer with
range summary. Never renders literal data — always `columns` + `data` props.

**Navbar** — 56px sticky, `background/80` with blur and bottom hairline. Left: breadcrumb or
page title. Right: global search (`⌘K`), environment badge, theme toggle, notifications,
account menu. Mobile: menu button + title + account.

**Sidebar** — `sidebar` surface with right hairline. Brand block, grouped nav with overline
group labels, active item = `sidebar-accent` fill + 2px leading indicator, collapse toggle
pinned to the footer above the account block. Tooltips when collapsed; ARIA `current="page"`.

**Toast** — Sonner, bottom-right desktop / top mobile, max 3 stacked, 5s auto-dismiss
(errors persist). Variants: `success`, `error`, `warning`, `info`, `loading`, each with icon,
title, optional description and one action. Mounted once in `__root.tsx`.

**Empty State** — centered in its container: illustration or muted icon in a circle, H3
title, one-line muted description, one primary action, optional secondary link. Variants:
`no-data` (first run), `no-results` (filters — offers "Clear filters"), `no-access`.

**Loading State** — skeletons that mirror final layout (never spinners for page loads):
metric-card, chart, and table-row skeletons. Inline spinner only inside buttons and small
async controls. Route transitions show a 2px top progress bar. Skeletons appear after 200ms
to avoid flicker.

**Error State** — icon in a `destructive/10` circle, title, plain-language description,
"Try again" primary + "Contact support" secondary, collapsible technical detail. Scopes:
inline field, card-level (widget failure, page stays usable), route-level boundary, global
boundary in `__root.tsx`.

---

## 4. Accessibility & quality bar

- Visible `focus-visible` ring on every interactive element; logical tab order.
- Keyboard: full nav, `Esc` closes overlays, arrow keys in menus/tables, `⌘K` search.
- Landmarks: `header`, `nav`, `main`, `aside`; live regions for toasts and async results.
- Contrast AA in both themes; hit targets ≥ 40×40 on touch.
- Currency always shows explicit code or symbol plus locale-correct grouping.
- Every state — loading, empty, error, partial — is designed before a screen ships.

---

## 5. Implementation notes

- Tokens live in `src/styles.css`: `@theme inline` mapping, `:root` and `.dark` values,
  custom utilities via `@utility`. No `tailwind.config.js` (Tailwind v4).
- Components in `src/components/ui/*` (primitives) and `src/components/dashboard/*`
  (composed, still data-agnostic). Variants via `class-variance-authority`.
- Layout shell (Sidebar + Navbar + `<Outlet />`) lives in one route layout, not per page.
- Data flows through route loaders and TanStack Query; components accept props only.
- Lint gate: no `style={{…}}`, no `bg-[#…]`, no `text-white`/`text-black` in components.
