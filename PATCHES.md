# Curapi Customizations

This fork applies Curapi visual identity to NewAPI's `web/default` theme +
flips a couple of backend defaults to be Curapi-friendly. This file lists
every Curapi-specific change so future-you (or upstream sync time) knows
what to keep / discard.

**Working branch**: `curapi/customizations` (push here, not main)

## Modified files

| File | Purpose | Merge strategy |
|------|---------|----------------|
| `common/constants.go` | `themeValue.Store("default")` at `init()` | manual review |
| `setting/system_setting/theme.go` | `Frontend: "default"` (default value) | manual review |
| `web/default/index.html` | `<title>Curapi</title>` + favicon `/favicon.svg` + Chinese description | manual review |
| `web/default/public/favicon.svg` | New file: Curapi yellow-green C-mark on dark | new file |
| `web/default/src/lib/constants.ts` | `DEFAULT_SYSTEM_NAME = 'Curapi'`, `DEFAULT_LOGO = '/favicon.svg'` | manual review |
| `web/default/src/main.tsx` | `initSystemBranding` → `warmStatusCache` (no longer overrides title/favicon from `/api/status`) | manual review |
| `web/default/src/components/layout/components/system-brand.tsx` | Hardcoded `[C] curapi` for both inline + sidebar variants; drops `useStatus`/`useSystemConfig`; hides version row | manual review |
| `web/default/src/hooks/use-sidebar-data.ts` | Removes `chat` navGroup (Playground + Chat) | manual review |
| `web/default/src/hooks/use-top-nav-links.ts` | Default modules disable rankings/docs/about; render branches for those three removed | manual review |
| `web/default/src/features/channels/components/drawers/channel-mutate-drawer.tsx` | Replace broken legacy Combobox on `type` field with inline `ChannelTypeCombobox`; creation-mode "fetch from upstream" now opens a select dialog instead of dumping all models | manual review |
| `web/default/src/features/channels/components/dialogs/select-fetched-models-dialog.tsx` | New file: creation-mode select-from-fetched dialog (mirrors classic theme's 「获取模型列表」UX) | new file |
| `web/default/src/i18n/locales/zh.json` | Three keys for the select dialog: `Add Selected ({{count}})`, `Deselect all`, `Select Models to Add`, `{{selected}} of {{total}} selected` | manual review |
| `web/default/src/styles/theme.css` | Curapi `--brand` token + system font stack | manual review |
| `web/default/src/routes/index.tsx` | Replace `<Home />` with redirect → `/sign-in` (unauth) or `/dashboard` (auth) | manual review |
| `web/default/src/features/auth/auth-layout.tsx` | Hardcoded `[C] curapi` mark + wordmark | manual review |
| `web/default/src/features/auth/sign-in/components/user-auth-form.tsx` | `bg-brand text-brand-foreground hover:bg-brand/90` on submit | manual review |
| `web/default/src/features/auth/sign-up/components/sign-up-form.tsx` | Same brand-color treatment | manual review |
| `web/default/src/features/keys/components/api-keys-primary-buttons.tsx` | brand-color "Create API Key" CTA | manual review |
| `web/default/src/features/dashboard/components/overview/overview-dashboard.tsx` | **735 LOC → ~30 LOC** (only SummaryCards + UptimePanel) | **OURS strategy** — never restore upstream's 7 panels |

## Why each change (rationale)

### Theme defaults (constants.go + theme.go)

- Upstream `common/constants.go:init()` does `themeValue.Store("classic")`
- DB option `theme` loading does **NOT** auto-trigger `syncThemeToCommon()` at startup — only `model/option.go:585` triggers it, and that path runs only when admin writes config (not on first load).
- Net result without our fix: a DB row `{"frontend":"default"}` exists but the runtime atomic stays "classic". User sees Semi UI legacy theme.
- Fix: hardcode init default to `"default"` so first deploy lands on the modern shadcn UI where Curapi customizations live.
- User can still flip back to "classic" via admin settings (the admin write path DOES sync).

### Brand token (theme.css)

- Added `--brand: oklch(0.949 0.275 122.5)` ≈ `#D9FF4B` (yellow-green) and `--brand-foreground: oklch(0.145 0 0)`.
- Restricted use: CTA buttons, accent underlines, key data signals only.
- Replaced `--font-sans` from `'Public Sans'` to `-apple-system, BlinkMacSystemFont, 'PingFang SC', 'HarmonyOS Sans', 'Microsoft YaHei', 'Helvetica Neue', system-ui, sans-serif`. No webfont needed; Chinese rendered via system fonts.
- Other tokens (background, foreground, primary, etc.) unchanged from upstream — NewAPI's neutral oklch palette already aligns with Curapi DESIGN.md (white/black/grey, small radii).

### Brand wordmark + favicon (index.html, constants.ts, main.tsx, system-brand.tsx)

- **Tab title**: hardcoded "Curapi" in `index.html` `<title>`. We removed the
  runtime override path in `main.tsx` (`initSystemBranding` → `warmStatusCache`)
  so even if a future admin sets `system_name` in DB, the tab still shows
  "Curapi". The status fetch is still warmed for other consumers.
- **Favicon**: `public/favicon.svg` — yellow-green Curapi `C` on dark
  rounded square. Linked via `<link rel="icon" type="image/svg+xml">` in
  `index.html`. Replaces upstream's `/logo.png` (which we leave on disk for
  any unaudited references).
- **Top app bar / sidebar header**: `system-brand.tsx` now hardcodes the
  same `[C] curapi` CSS-styled mark used in `auth-layout.tsx` for visual
  consistency (theme-adaptive: foreground bg, background C). Drops the
  dynamic `useStatus().system_name` and `useSystemConfig().logo` reads.
  Version row removed from sidebar variant — backend reports NewAPI's
  upstream version which would leak the fork origin.

### Nav scoping (use-sidebar-data.ts, use-top-nav-links.ts)

- **Sidebar**: removed the `chat` navGroup (Playground + Chat). Curapi
  positions itself as an API relay for developers — these features dilute
  focus and confuse the value proposition. Imports for `FlaskConical` and
  `MessageSquare` cleaned up.
- **Top navbar**: removed Rankings / Docs / About entirely.
  - Rankings: meaningful for chat aggregators, not for an API relay.
  - Docs + About: live on `curapi.top` (marketing site), not the console.
  - Default `HeaderNavModules` flips them to `false`, AND the if-blocks
    that render them are gone — DB cannot resurface them. Pricing /
    Console / Home links preserved.

### Channel "fetch from upstream" select-flow (channel-mutate-drawer.tsx + select-fetched-models-dialog.tsx)

- **Behavior gap vs classic**: Classic theme's 「获取模型列表」 fetches the
  upstream's model list and opens a modal where the user picks which models
  to add. Default theme's "Fetch from Upstream" (creation mode) instead
  dumped ALL fetched models into the field — not great when the upstream
  exposes 50–200 model IDs (most of which the user doesn't want exposed
  through their channel).
- **Fix**: New `SelectFetchedModelsDialog` (creation mode only — the editing
  flow already uses `FetchModelsDialog`, which has different concerns:
  redirect-aware categorization, comparison against the saved channel's
  current model list, optional save-to-API path). The new dialog: pre-selects
  all fetched models (most users want most), supports search, has a
  Select-all/Deselect-all toggle scoped to the search filter, confirms with
  a "Add Selected (n)" button. The drawer's `handleFetchModels` (creation
  branch) now opens this dialog instead of `updateModels(allModels)`.
- **Why a new dialog instead of refactoring `FetchModelsDialog`**: That
  component is heavily coupled to `useChannels().currentRow` (existing-channel
  rendering, GET-by-id endpoint, save-to-API path). Adapting it to creation
  mode would mean threading a creation-mode prop through ~10 sites with
  conditional logic, increasing the upstream-sync diff surface for marginal
  reuse. A dedicated ~150-LOC dialog is cleaner.

### Channel type combobox bug fix (channel-mutate-drawer.tsx)

- **Bug**: Upstream's `<Combobox options={...}>` (LegacyComboboxInput) renders
  the raw value in its `<Input>` (`value={String(field.value)}` → "1"). After
  picking a channel type, the field shows a number like "1" / "8" instead of
  the human-readable name like "OpenAI" / "Custom" — a regression from the
  classic theme's `Form.Select` which renders the option label.
- **Fix**: Replaced the call site with an inline `ChannelTypeCombobox` using
  the same Popover + Command pattern as `api-key-group-combobox.tsx`. Trigger
  button shows the matched option label + icon; the popover provides search
  with proper label rendering on each item; a checkmark indicates the current
  selection. Form state still stores the numeric type ID.
- **Scope**: localized to this drawer. The shared `LegacyComboboxInput` is
  unchanged (other call sites use it as a free-text + suggestion input —
  changing its render would break those flows). If the same bug is found
  elsewhere, fix at the call site too rather than at the shared component.

### Auth pages visual unification

- `auth-layout.tsx`: hardcoded Curapi C-mark + 'curapi' wordmark replaces upstream's dynamic logo + systemName from `/api/status`. We own the brand on this fork.
- Sign-in / Sign-up: single className change on the primary submit button (`bg-brand text-brand-foreground hover:bg-brand/90`). All conditional auth methods (passkey / WeChat / Turnstile / OAuth) preserved — they auto-hide when backend disables them.

### Landing redirect (routes/index.tsx)

- Upstream root URL renders `<Home />` (NewAPI's marketing landing).
- We redirect: authenticated → `/dashboard`, otherwise → `/sign-in`.
- Marketing is handled by `curapi.top` (separate Next.js site) — console doesn't need duplicate marketing.

### API Keys CTA

- Single Button in `api-keys-primary-buttons.tsx`. Added brand classes.
- Tables / drawers / dialogs use shadcn defaults (already match Resend style).

### Dashboard simplification

- Upstream: **735 LOC, 7 panels** (Setup Guide hero with gradient backdrop + RequestPreview mock terminal + 3-step tutorial + Quick Actions sidebar + ApiInfoPanel + AnnouncementsPanel + FAQPanel + UptimePanel + SummaryCards).
- Curapi: **~30 LOC, 2 panels** (SummaryCards + UptimePanel).
- Reasons:
  - Resend-style dashboards favor a few clear data signals over busy panels.
  - `curapi.top` owns "get started" guidance — console doesn't need a duplicate setup hero.
  - Announcements / FAQ live on `curapi.top` (blog + docs).
  - API endpoint info belongs in `/docs`, not the dashboard.
- This is the most invasive change. Use **OURS** merge strategy on this file (see below).

## Upstream sync workflow

```bash
# 1. Fetch latest upstream
git fetch upstream

# 2. Create a sync branch off our customizations
git checkout -b sync/upstream-$(date +%Y%m%d) curapi/customizations
git merge upstream/main

# 3. Resolve conflicts file-by-file:
#    - For files in the "Modified files" table: review the upstream diff;
#      if it's a bug fix in code we didn't touch, accept; if it touches our
#      Curapi-specific lines, prefer 'ours' and re-apply our intent.
#    - For overview-dashboard.tsx: ALWAYS take ours (we intentionally
#      simplified; never restore the 7 panels).
#    - For all other unconflicted upstream changes: accept.

# 4. Build to verify nothing broke:
docker build -t curapi-test .
# OR locally:
#   cd web/default && bun install && bun run build
#   cd ../classic && bun install && bun run build
#   cd .. && go build

# 5. If clean, fast-forward customizations:
git checkout curapi/customizations
git merge sync/upstream-XXX
git push origin curapi/customizations
```

### Optional: pin overview-dashboard.tsx with `.gitattributes`

To skip manual conflict resolution on every upstream sync:

```bash
# In fork root:
echo "web/default/src/features/dashboard/components/overview/overview-dashboard.tsx merge=ours" >> .gitattributes
git config merge.ours.driver true
git add .gitattributes
git commit -m "Pin OverviewDashboard merge strategy to 'ours'"
```

## Production rebuild

After pushing a commit to `curapi/customizations`:

```bash
ssh root@185.200.65.138
cd /root/docker/curapi-console
docker compose up -d --build       # re-clones git context, fresh build
docker logs curapi-console -f      # watch startup
```

Build time: ~5-10 min (multi-stage: bun frontend + Go backend + debian runtime).

The server-side `docker-compose.yml` uses git URL as build context:

```yaml
build:
  context: https://github.com/wangjc683/curapi-console.git#curapi/customizations
```

So pushing a commit to `origin/curapi/customizations` is enough — no separate image registry needed.
