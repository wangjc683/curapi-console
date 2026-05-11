/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export function setStatusData(data) {
  localStorage.setItem('status', JSON.stringify(data));
  localStorage.setItem('system_name', data.system_name);
  localStorage.setItem('logo', data.logo);
  localStorage.setItem('footer_html', data.footer_html);
  localStorage.setItem('quota_per_unit', data.quota_per_unit);
  // 兼容：保留旧字段，同时写入新的额度展示类型
  localStorage.setItem('display_in_currency', data.display_in_currency);
  localStorage.setItem('quota_display_type', data.quota_display_type || 'USD');
  localStorage.setItem('enable_drawing', data.enable_drawing);
  localStorage.setItem('enable_task', data.enable_task);
  localStorage.setItem('enable_data_export', data.enable_data_export);
  localStorage.setItem('chats', JSON.stringify(data.chats));
  localStorage.setItem(
    'data_export_default_time',
    data.data_export_default_time,
  );
  localStorage.setItem(
    'default_collapse_sidebar',
    data.default_collapse_sidebar,
  );
  localStorage.setItem('mj_notify_enabled', data.mj_notify_enabled);
  if (data.chat_link) {
    // localStorage.setItem('chat_link', data.chat_link);
  } else {
    localStorage.removeItem('chat_link');
  }
  if (data.chat_link2) {
    // localStorage.setItem('chat_link2', data.chat_link2);
  } else {
    localStorage.removeItem('chat_link2');
  }
  if (data.docs_link) {
    localStorage.setItem('docs_link', data.docs_link);
  } else {
    localStorage.removeItem('docs_link');
  }
}

export function setUserData(data) {
  localStorage.setItem('user', JSON.stringify(data));
  setAuthMarker();
}

/**
 * Cross-subdomain "logged-in" marker cookie.
 *
 * Why: the Curapi landing site (curapi.subsage.top) needs to know whether the
 * visitor is already logged in to the console (api.curapi.subsage.top) so it
 * can show a "Console →" button instead of "Login" / "Get API Key". The console
 * session itself (gin-sessions) is a host-only cookie that the landing site
 * cannot read, and localStorage is sandboxed per origin. So we set a tiny
 * non-sensitive boolean cookie scoped to the parent domain — readable by both
 * sides via document.cookie.
 *
 * This is an OPTIMISTIC marker: the cookie may outlive the server-side session
 * (e.g. session expiry, server-side invalidation). In that case the landing
 * site shows "Console →", the user clicks, and the console redirects them to
 * /login. Mild but acceptable trade-off vs. wiring up CORS + credentialed
 * fetches on every landing page view.
 *
 * NOTE: the Domain attribute is set by inspecting window.location.hostname and
 * walking up to the registrable parent (skipping the leftmost label). For
 * localhost / single-label hosts the marker is set host-only (still works for
 * dev where landing + console share localhost).
 */
function getMarkerCookieDomain() {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  // localhost / single-label / IP — leave Domain off (host-only)
  if (!host || host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host))
    return null;
  const parts = host.split('.');
  if (parts.length < 2) return null;
  // Drop the leftmost label so e.g. api.curapi.subsage.top → .curapi.subsage.top
  return '.' + parts.slice(1).join('.');
}

export function setAuthMarker() {
  if (typeof document === 'undefined') return;
  const domain = getMarkerCookieDomain();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const domainAttr = domain ? `; Domain=${domain}` : '';
  // 7 days — matches typical session lifetime; refreshed every time
  // setUserData runs (i.e. on login + on /api/user/self refresh).
  document.cookie = `curapi_authed=1; Path=/; Max-Age=604800; SameSite=Lax${secure}${domainAttr}`;
}

export function clearAuthMarker() {
  if (typeof document === 'undefined') return;
  const domain = getMarkerCookieDomain();
  const domainAttr = domain ? `; Domain=${domain}` : '';
  // Setting Max-Age=0 with the same Path/Domain deletes it.
  document.cookie = `curapi_authed=; Path=/; Max-Age=0; SameSite=Lax${domainAttr}`;
}
