# Curapi Customizations (classic theme)

This fork applies Curapi visual identity on top of NewAPI's `web/classic/`
theme (Semi UI). The earlier `web/default/` customization track was abandoned
because the new shadcn-based theme lags too far behind classic in admin
functionality for our v0.1 timeline — see `docs/v0.1-deployment.md` in the
marketing repo for the strategy pivot rationale.

**Working branch**: `curapi/customizations` (push here, not main)

**Upstream parent**: NewAPI `d146e45e`. The earlier `web/default/`
customizations (5a6805b4 → c84fac0c, 12 commits) were reverted by `a98c1045`,
which is the parent of this classic-track work.

## Modified files

| File | Purpose | Notes |
|------|---------|-------|
| `web/classic/index.html` | Tab title → "Curapi", favicon → `/curapi-logo.png` + apple-touch-icon, Chinese + English meta descriptions rewritten for Curapi positioning | hardcoded; no runtime override |
| `web/classic/public/curapi-logo.png` | New file: official Curapi brand logo (1254×1254 PNG, shared with marketing site) | used by favicon, apple-touch-icon, HeaderLogo via getLogo() |
| `web/classic/public/favicon.svg` | Legacy: yellow-green Curapi C-mark on dark rounded square — kept on disk but no longer referenced (replaced by curapi-logo.png) | safe to remove on next cleanup pass |
| `web/classic/src/helpers/utils.jsx` | `getSystemName()` hardcoded "Curapi"; `getLogo()` hardcoded "/curapi-logo.png" (localStorage values from /api/status are ignored — we own the brand) | propagates everywhere via centralized getters |
| `web/classic/src/index.css` | (1) `--curapi-brand` token + `.curapi-brand-btn` utility class. (2) System font stack. (3) **Layer 1 Semi UI reskin**: primary blue → zinc-900, primary-light-* tints → neutral gray, lighter border, flat cards, tighter form radii, sidebar hover/selected use neutral gray | Light mode only — dark mode keeps Semi defaults for v0.1 |
| `web/classic/src/App.jsx` | New `RootRedirect` component intercepts `/` (was NewAPI Home) and routes auth → `/console`, else → `/login`. Marketing site is the public-facing home (curapi.subsage.top); console domain is operational-only | the `pages/Home` import is dropped |
| `web/classic/src/components/auth/LoginForm.jsx` | (1) Apply `curapi-brand-btn` to the "继续" submit button. (2) New `useEffect` redirects already-logged-in users to `/console` (was a dead-end when arriving via marketing CTAs) | two-line addition |
| `web/classic/src/components/auth/RegisterForm.jsx` | (1) Apply `curapi-brand-btn` to the "注册" submit button. (2) Same already-authed redirect to `/console` | two-line addition |
| `web/classic/src/hooks/common/useNavigation.js` | (1) Remove `文档` + `关于` from top nav `allLinks`. (2) `首页` link now external → `https://curapi.subsage.top` (marketing IS Curapi home) | console domain has zero marketing surface |
| `web/classic/src/components/layout/SiderBar.jsx` | Remove the `chat` section JSX block (operational hooks remain in case upstream sync brings something to revive) | Curapi positions as an API relay, not a chat product |
| `web/classic/src/components/layout/Footer.jsx` | Bottom attribution: "设计与开发由 New API" → "基于 NewAPI 构建" | more accurate; we built on it, didn't design it |

## Why each change

### Brand identity (index.html, utils.jsx, favicon.svg)

- Tab + favicon + system_name need to say "Curapi" regardless of what the
  backend `system_name` option is set to.
- `utils.jsx` fallbacks land everywhere — HeaderLogo, Footer, auth forms, etc.
  all read through `getSystemName()` / `getLogo()`, so a one-file change
  propagates to all surfaces without touching component code.
- `favicon.svg`: 64×64 viewBox, yellow-green C (`#D9FF4B`) on near-black bg.
  Same design as the brand mark in the marketing site, so console + curapi.top
  feel like one product.

### Visual tokens (index.css)

- **Font stack**: drop the upstream `Lato` webfont dependency, use a system
  stack with Chinese fallbacks (`PingFang SC` → `HarmonyOS Sans` → `Microsoft
  YaHei`). No webfont request; consistent rendering in CN OSes.
- **Brand variable**: `--curapi-brand` exposed as a CSS variable so
  future styles can reference it without re-declaring the color.
- **`.curapi-brand-btn` utility**: applies yellow-green to opt-in buttons via
  `!important` (needed to win against Semi's inline style cascade). The
  "exceptional attention" color above the default primary. Used sparingly —
  only on hero CTAs (login, register) for v0.1. Adding it to more buttons
  would dilute the signal.
- **Layer 1 Semi reskin** (lights up everywhere — admin too):
  - `--semi-color-primary` family: ByteDance blue → zinc-900 (`#18181b`),
    zinc-800 hover, zinc-950 active. Stripe/Resend "primary = near-black"
    pattern. Affects every `<Button type='primary'>`, focus rings, active
    tabs, selected menu items, links.
  - `--semi-color-primary-light-*` (subtle bg for selected/hover):
    neutral gray tints instead of blue. Selected sidebar item gets the
    soft gray fill Resend uses.
  - `--semi-color-border`: lighter (`rgba(0,0,0,0.08)`) — more refined.
  - `.semi-card`: no shadow, thin border (Resend signature flat cards).
  - Tighter `border-radius: 6px` on Buttons / Inputs / Selects / Form inputs.
  - `.sidebar-nav-item:hover` / `.sidebar-nav-item-selected`: rewritten
    from `rgba(var(--semi-blue-0), 0.08/0.12)` (which referenced a
    blue-tinted token) to neutral gray rgba.
- **NOT touched**: `--semi-color-warning/-danger/-success` keep their semantic
  hues. `--semi-blue-*` numeric primitives left intact (still available for
  any module that wants blue specifically — Curapi just doesn't lead with it).
- **Dark mode**: NOT redefined. `body[theme-mode='dark']` still uses Semi
  defaults — v0.1 only ships polished light mode.

### Nav scoping (useNavigation.js, SiderBar.jsx)

- Top nav (`mainNavLinks`): we own `curapi.top` for marketing — docs +
  about live there, not in console. Removing them from the in-app nav
  keeps the surface focused on the actual product (Console + Pricing).
- Sidebar `chat` section: Curapi is an API relay, not a chat aggregator.
  Operational hooks (`chatMenuItems`, `chatItems`) kept intact — only the
  rendering JSX is gone, so upstream syncs that touch the hooks won't conflict.

### Footer attribution

- Original "设计与开发由 New API" claims NewAPI designed and developed the
  whole console. Inaccurate for Curapi — we built on top.
- "基于 NewAPI 构建" is honest, preserves the link to upstream
  (AGPL spirit), and reads naturally in Chinese.

## Upstream sync workflow

```bash
# 1. Fetch latest upstream
git fetch upstream

# 2. Create a sync branch off our customizations
git checkout -b sync/upstream-$(date +%Y%m%d) curapi/customizations
git merge upstream/main

# 3. Resolve conflicts file-by-file:
#    - All files in the table above: review the upstream diff. If the
#      upstream change is in code we didn't touch, accept. If it touches
#      a Curapi-specific line, prefer 'ours' and re-apply our intent.
#    - For all other unconflicted upstream changes: accept.

# 4. Build to verify nothing broke:
docker build -t curapi-test .
# OR locally:
#   cd web/classic && bun install && bun run build

# 5. If clean, fast-forward customizations:
git checkout curapi/customizations
git merge sync/upstream-YYYYMMDD
git push origin curapi/customizations
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

So pushing a commit to `origin/curapi/customizations` is enough — no separate
image registry needed.
