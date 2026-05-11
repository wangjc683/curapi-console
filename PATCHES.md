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
| `web/classic/index.html` | Tab title → "Curapi", favicon → SVG C-mark, Chinese + English meta descriptions rewritten for Curapi positioning | hardcoded; no runtime override |
| `web/classic/public/favicon.svg` | New file: yellow-green Curapi C-mark on dark rounded square | also serves as logo image fallback |
| `web/classic/src/helpers/utils.jsx` | `getSystemName()` fallback "New API" → "Curapi"; `getLogo()` fallback "/logo.png" → "/favicon.svg" | upstream stays at /logo.png; only the in-memory fallback changes |
| `web/classic/src/index.css` | Inject `--curapi-brand` token + replace font-family with system stack + add `.curapi-brand-btn` utility class | Semi UI primary tokens untouched (keeps wider UI calm); brand is opt-in via class |
| `web/classic/src/components/auth/LoginForm.jsx` | Apply `curapi-brand-btn` to the "继续" submit button | single className addition |
| `web/classic/src/components/auth/RegisterForm.jsx` | Apply `curapi-brand-btn` to the "注册" submit button | single className addition |
| `web/classic/src/hooks/common/useNavigation.js` | Remove `文档` + `关于` from top nav `allLinks` | Curapi marketing site (curapi.top) owns docs + about |
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
- **`.curapi-brand-btn` utility**: applies brand color to opt-in buttons via
  `!important` (needed to win against Semi's inline style cascade). Used
  sparingly — only on hero CTAs (login, register) for v0.1. Adding it to more
  buttons would dilute the signal.
- **NOT touched**: Semi's `--semi-color-primary` and other tokens. Wholesale
  swap would tint the entire UI yellow-green (links, focus rings, etc.) and
  fight Semi's accessibility-tuned palette. The opt-in class is safer.

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
