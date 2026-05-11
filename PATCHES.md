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

**Current HEAD**: `ab7c5184` Unify brand with marketing + intelligent auth redirect.
10 commits of classic-track customizations on top of the revert. Full commit list
in the marketing repo's `docs/v0.1-deployment.md`.

## Modified files

| File | Purpose | Notes |
|------|---------|-------|
| `web/classic/index.html` | Tab title → "Curapi", favicon → `/curapi-logo.png` + apple-touch-icon, Chinese + English meta descriptions rewritten for Curapi positioning | hardcoded; no runtime override |
| `web/classic/public/curapi-logo.png` | New file: official Curapi brand logo (1254×1254 PNG, shared with marketing site) | used by favicon, apple-touch-icon, HeaderLogo via getLogo() |
| `web/classic/public/favicon.svg` | Legacy: yellow-green Curapi C-mark on dark rounded square — kept on disk but no longer referenced (replaced by curapi-logo.png) | safe to remove on next cleanup pass |
| `web/classic/src/helpers/utils.jsx` | `getSystemName()` hardcoded "Curapi"; `getLogo()` hardcoded "/curapi-logo.png" (localStorage values from /api/status are ignored — we own the brand) | propagates everywhere via centralized getters |
| `web/classic/src/helpers/utils.jsx` | (cont'd) Also exports `CURAPI_CURRENCY_KEY` constant + `getEffectiveQuotaDisplayType()` helper for per-user currency override (Layer 4 currency system) | helper lives here not in render.jsx to avoid circular import |
| `web/classic/src/helpers/render.jsx` | `getCurrencyConfig()`, `renderQuota()`, `renderQuotaNumberWithDigit()`, `renderQuotaWithAmount()`, `getQuotaDisplayType()`, `renderQuotaWithPrompt()` all switched from raw `localStorage.getItem('quota_display_type')` to the central helper. Plus CNY fallback rate `1 → 7` for consistency | 7 USD↔CNY rate matches user's pinned exchange rate |
| `web/classic/src/index.css` | (1) `--curapi-brand` token + `.curapi-brand-btn` utility class. (2) System font stack. (3) **Layer 1 Semi UI reskin**: primary blue → zinc-900, primary-light-* tints → neutral gray, lighter border, flat cards, tighter form radii, sidebar hover/selected use neutral gray | Light mode only — dark mode keeps Semi defaults for v0.1 |
| `web/classic/src/App.jsx` | New `RootRedirect` component intercepts `/` (was NewAPI Home) and routes auth → `/console`, else → `/login`. Marketing site is the public-facing home (curapi.subsage.top); console domain is operational-only | the `pages/Home` import is dropped |
| `web/classic/src/components/auth/LoginForm.jsx` | (1) Apply `curapi-brand-btn` to the "继续" submit button. (2) Layer 2: page title heading={3}→heading={2} with tighter tracking; pt-6 pb-2 → pt-8 pb-4; form space-y-3 → space-y-4. (3) New `useEffect` redirects already-logged-in users to `/console` | spans Layer 0 + Layer 2 + brand-unify commits |
| `web/classic/src/components/auth/RegisterForm.jsx` | Same three changes as LoginForm | symmetric |
| `web/classic/src/hooks/common/useNavigation.js` | (1) Remove `文档` + `关于` from top nav `allLinks`. (2) `首页` link now external → `https://curapi.subsage.top` (marketing IS Curapi home) | console domain has zero marketing surface |
| `web/classic/src/components/layout/SiderBar.jsx` | Remove the `chat` section JSX block (operational hooks remain in case upstream sync brings something to revive) | Curapi positions as an API relay, not a chat product |
| `web/classic/src/components/layout/Footer.jsx` | Bottom attribution: "设计与开发由 New API" → "基于 NewAPI 构建" | more accurate; we built on it, didn't design it |
| `web/classic/src/components/layout/headerbar/CurrencySelector.jsx` | New file: header-level `¥ / $` dropdown that writes localStorage `curapi_currency_preference` and reloads the page. Mirrors LanguageSelector pattern | brute-force reload is cheaper than threading a React context through every getCurrencyConfig caller |
| `web/classic/src/components/layout/headerbar/ActionButtons.jsx` | Insert `<CurrencySelector>` between ThemeToggle and LanguageSelector | one-line addition |
| `web/classic/src/i18n/locales/zh.json` | Add "人民币" + "切换货币" entries (paired with existing "美元") | minimal i18n surface |
| `web/classic/src/i18n/locales/en.json` | Same two entries with English translations | |
| `web/classic/src/hooks/model-pricing/useModelPricingData.jsx` | Bug fix: Pricing page (模型广场) used to read `statusState.status.quota_display_type` directly, bypassing our localStorage override. Switched to `getEffectiveQuotaDisplayType()` | otherwise header ¥/$ toggle didn't affect Pricing page rendering |
| `web/classic/src/pages/Setting/Ratio/components/ModelPricingEditor.jsx` | New `CurrencyPriceInput` wrapper: when header is in ¥ mode, all 7 per-token price inputs + the fixed per-call price display USD-stored values × 7 as ¥, and save divides back to USD. Storage stays USD-anchored (NewAPI quota system anchor) | preserves intermediate typing ("7." → "7.5") via local text state |
| `web/classic/src/components/dashboard/StatsCards.jsx` | Layer 2 polish: outer mb-4 → mb-8, grid gap-4 → gap-6, item label text-xs → text-[11px] uppercase tracking-wide, value text-lg → text-2xl tracking-tight | dashboard numbers feel like the win, not crammed |
| `web/classic/src/components/dashboard/index.jsx` | Layer 2 polish: section gaps mb-4 → mb-8, info-panels grid gap-4 → gap-6 | breathing room between rows |
| `web/classic/src/components/table/tokens/TokensDescription.jsx` | Layer 2 polish: "令牌管理" was inline blue Text → neutral-gray `<Title heading={5}>`. Key icon demoted to gray-500 (title leads, not icon) | blue was NewAPI residue |
| `web/classic/src/components/topup/RechargeCard.jsx` | Layer 2 polish: card header dropped blue Avatar+badge, replaced with bare CreditCard icon + Title heading={4}; preset amount grid gap-2 → gap-4 + bodyStyle padding 12px → 16px 14px; payment method buttons px-4 py-2 → px-5 py-2.5 | also removed unused Avatar import |
| `web/classic/src/components/table/usage-logs/UsageLogsActions.jsx` | Layer 2 polish: 3 colored stat tags (blue/pink/white + heavy shadow) → neutral white pills with thin border, gray-500 label + bold value, 12px gap between | data should read as data, not compete for attention |
| `web/classic/src/helpers/data.js` | (1) `setUserData` now also calls `setAuthMarker()`. (2) New exported `setAuthMarker()` / `clearAuthMarker()` — write/clear a non-sensitive `curapi_authed=1` cookie scoped to the registrable parent domain (e.g. `.curapi.subsage.top`), 7-day Max-Age, SameSite=Lax, Secure on https. Landing site reads this to flip "登录 / 获取 API Key" → "控制台" | Domain derived from `window.location.hostname` by dropping the leftmost label; localhost / IP / single-label hosts stay host-only |
| `web/classic/src/hooks/common/useHeaderBar.js` | Active logout: call `clearAuthMarker()` after `localStorage.removeItem('user')` | landing must not show "控制台" after a real logout |
| `web/classic/src/helpers/utils.jsx` | 401-interceptor logout (the auto kick when a request comes back unauthorized): also call `clearAuthMarker()` | covers expired-session edge case |
| `web/classic/src/helpers/api.js` | OAuth re-login flow that calls `prepareOAuthState({ shouldLogout: true })`: also call `clearAuthMarker()` | rarely hit, but the marker must stay in sync with the session |
| `web/classic/src/components/settings/PersonalSetting.jsx` | Account-self-delete flow: call `clearAuthMarker()` before `navigate('/login')` | account is gone, marker must die with it |

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

### Currency system (CN-first + per-user toggle)

NewAPI's quota system is anchored to USD (`QuotaPerUnit = 500_000` units = $1).
Display currency is a global admin setting `general_setting.quota_display_type`
(USD / CNY / TOKENS / CUSTOM). Default upstream is USD.

Curapi positioning is for Chinese customers, so CNY should be the default.
Plus power users sometimes want USD. We need both.

**Decision — two-layer override**:
1. **Per-user preference** lives in `localStorage[CURAPI_CURRENCY_KEY]`
   (`curapi_currency_preference`). Set by the header `<CurrencySelector>`.
2. **Backend admin setting** as fallback.
3. **'CNY' as final default** if neither is set (was 'USD' upstream).

`getEffectiveQuotaDisplayType()` in `helpers/utils.jsx` resolves priority.
Every callsite of `localStorage.getItem('quota_display_type')` in
`render.jsx` switched to the helper. Pricing page hook
(`useModelPricingData`) had its own bypass via `statusState.status.quota_display_type`
— also routed through the helper.

**Page reload on toggle**: writing localStorage then `window.location.reload()`.
A reactive React context would be cleaner but requires turning every
`getCurrencyConfig()` callsite into a hook — dozens of files. Reload is
cheap and unambiguous.

**Admin price input in CNY**: `CurrencyPriceInput` wrapper in
`ModelPricingEditor.jsx` converts at input boundary — USD storage × rate
for display, divide back for save. Preserves intermediate typing ("7." →
"7.5") via local text state. Round-trip precision OK at 4-decimal scale.

**TieredPricingEditor NOT covered** — advanced path, low admin usage for
v0.1. Add later if needed.

### Layer 1 Semi UI reskin (index.css token overrides)

ByteDance Semi UI defaults feel "Chinese enterprise console"; Curapi
targets Resend/Stripe minimal aesthetic. Surgical token overrides:

- `--semi-color-primary` family: blue (#3273F5) → zinc-900 (#18181b).
  Affects all primary buttons, focus rings, active tabs, selected menu
  items, links.
- `--semi-color-primary-light-*` (subtle bg): blue tint → neutral gray
  `rgba(0,0,0,0.04~0.10)`. Sidebar selected item gets Resend soft-gray fill.
- `--semi-color-border`: lighter rgba(0,0,0,0.08).
- `.semi-card`: no shadow, thin border.
- `.semi-button` / inputs: `border-radius: 6px`.
- `.sidebar-nav-item:hover` / `-selected`: rewritten from
  `rgba(var(--semi-blue-0), ...)` to neutral gray rgba.

Brand yellow-green stays as the exceptional CTA color above neutral primary.
Warning / danger / success keep semantic hues. Dark mode (Semi default)
NOT redefined for v0.1.

### Layer 2 high-traffic page polish

After Layer 1 lands globally, surgical className tweaks on individual
high-traffic pages (no logic changes, no Semi component replacements):

- **Sign-in / Sign-up**: heading={3}→heading={2}, more breathing.
- **Dashboard overview**: stat numbers text-lg→text-2xl, uppercase
  small-caps labels, section gaps bumped to mb-8 / gap-6.
- **API Keys**: Title hierarchy strengthened (was inline blue Text).
- **Wallet (Top-up)**: Card header simplified, preset amounts looser,
  payment buttons bigger.
- **Logs**: 3 colored stat tags (blue/pink/white + shadows) → neutral pills.

### Already-logged-in auth redirect (LoginForm + RegisterForm)

NewAPI upstream's `/login` and `/register` render the form regardless of
auth state. A user clicking "获取 API Key" from landing while already
logged in lands on a dead-end form. We added a `useEffect` in each
that checks `userState?.user?.id` and `navigate('/console', { replace: true })`.

### Cross-subdomain auth marker cookie (data.js)

**Problem**: Landing site at `curapi.subsage.top` needs to show "控制台 →"
instead of "登录 / 获取 API Key" when the visitor is already authenticated
in the console at `api.curapi.subsage.top`. But:

- gin-sessions cookies are host-only (no Domain attribute) — the landing
  origin literally cannot see them.
- `localStorage['user']` is per-origin — same problem.
- CORS + credentialed fetch on every page view would work but requires
  changing the session cookie to `SameSite=None; Secure` (broader attack
  surface) and adding a network round-trip with FOUC.

**Solution**: a tiny non-sensitive boolean cookie named `curapi_authed`,
value `1`, scoped to the registrable parent domain (`.curapi.subsage.top`).
Written in `setUserData()` (called on login + status refresh), cleared in
all four logout paths (active logout, 401-auto-kick, OAuth-relogin,
account-delete). Landing reads it via `document.cookie` in a tiny hook
(`lib/use-auth-marker.ts`).

**Why this is optimistic**: the cookie can outlive the server session.
If the session is invalidated server-side but the cookie remains, the
landing shows "控制台 →", user clicks, NewAPI redirects them to /login.
Mild but acceptable.

**Domain derivation**: `getMarkerCookieDomain()` reads
`window.location.hostname` and drops the leftmost label, so
`api.curapi.subsage.top` → `.curapi.subsage.top`. Localhost / IP / single-
label hosts get no Domain attr (cookie stays host-only) which still works
for the dev case where landing + console share `localhost`.

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
