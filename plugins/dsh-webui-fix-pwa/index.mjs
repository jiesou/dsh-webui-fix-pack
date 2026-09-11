// Node half: inject theme-color metas, patch manifest to standalone, serve PWA icon.
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { DEFAULT_PREFERENCE, THEME_PREFERENCE_FIELD, THEME_SETTINGS_NAMESPACE } from '@deepseek-ai/dsh-client-ui-theme'

const META_ATTR = 'data-dsh-webui-fix-pwa'
const FALLBACK_LIGHT = 'rgb(255, 255, 255)'
const FALLBACK_DARK = 'rgb(21, 21, 23)'
const ICON_PATH = '/dsh-webui-fix-pwa/icon.svg'
const ICON_SIZE = 512
const ICON_SCALE = 6.5
const ICON_PAD_X = 92
const ICON_PAD_Y = 92
const require = createRequire(import.meta.url)

function readAsset(specifier) {
  try {
    return readFileSync(require.resolve(specifier), 'utf8')
  } catch {
    return null
  }
}

function designTokens() {
  const fallback = { light: FALLBACK_LIGHT, dark: FALLBACK_DARK }
  const css = readAsset('@deepseek-ai/dsh-client-ui-theme/styles/design-platform.css')
  if (css === null) return fallback
  const token = (name) => {
    const match = css.match(new RegExp(`--${name}:\\s*([^;]+);`))
    return match === null ? null : match[1].trim()
  }
  const light = token('dsw-static-neutral-bluish-00')
  const dark = token('dsw-static-neutral-bluish-950')
  return light === null || dark === null ? fallback : { light, dark }
}

function manifestBase() {
  const source = readAsset('@deepseek-ai/dsh-web-frontend/dist/manifest.webmanifest')
  if (source === null) throw new Error('dsh-webui-fix-pwa: cannot resolve @deepseek-ai/dsh-web-frontend/dist/manifest.webmanifest')
  return JSON.parse(source)
}

function pwaIconSvg() {
  const source = readAsset('@deepseek-ai/dsh-web-frontend/dist/favicon.svg')
  if (source === null) return null
  const path = source.match(/<path\b[^>]*\/>/)
  if (path === null) return null
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}"><circle cx="256" cy="256" r="256" fill="#ffffff"/><g transform="translate(${ICON_PAD_X} ${ICON_PAD_Y}) scale(${ICON_SCALE})">${path[0]}</g></svg>`
}

function injectThemeColorMetas(html, light, dark, preference) {
  const apple = '<meta name="mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />'
  let metas = ''
  if (preference === 'light') {
    metas = `<meta name="theme-color" ${META_ATTR} content="${light}" />`
  } else if (preference === 'dark') {
    metas = `<meta name="theme-color" ${META_ATTR} content="${dark}" />`
  } else {
    metas = `<meta name="theme-color" ${META_ATTR} media="(prefers-color-scheme: light)" content="${light}" /><meta name="theme-color" ${META_ATTR} media="(prefers-color-scheme: dark)" content="${dark}" />`
  }
  const style = preference === 'light'
    ? `<style ${META_ATTR}>html{background:${light};color-scheme:light}</style>`
    : preference === 'dark'
      ? `<style ${META_ATTR}>html{background:${dark};color-scheme:dark}</style>`
      : `<style ${META_ATTR}>html{background:${light}}@media (prefers-color-scheme: dark){html{background:${dark}}}html{color-scheme:light dark}</style>`
  const injection = `${metas}${apple}${style}`
  let out = html.includes('</head>')
    ? html.replace('</head>', `${injection}</head>`)
    : `${html}${injection}`
  // iOS notch: without viewport-fit=cover the status-bar area stays white.
  if (!/viewport-fit\s*=\s*cover/.test(out)) {
    out = out.replace(
      /<meta\s+name="viewport"\s+content="([^"]*)"\s*\/?>/,
      (_, content) => `<meta name="viewport" content="${content}, viewport-fit=cover" />`,
    )
  }
  // Chromium fetches the manifest with credentials omitted unless the link is
  // credentialed, which would drop the scheme cookie the manifest color needs.
  return out.replace(
    /<link\b[^>]*\brel="manifest"[^>]*>/,
    (tag) => (/\bcrossorigin\b/.test(tag) ? tag : tag.replace(/\s*\/?>$/, (end) => ` crossorigin="use-credentials"${end}`)),
  )
}

function currentPreference(ctx) {
  try {
    return ctx.get('settings')?.get?.(THEME_SETTINGS_NAMESPACE)?.[THEME_PREFERENCE_FIELD] ?? DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

// The browser half reports the scheme it actually resolved (which is the only
// place `system` is resolvable) back in this cookie.
function cookieScheme(req) {
  const header = req.headers?.cookie
  if (typeof header !== 'string') return null
  const match = header.match(/(?:^|;\s*)dsh-color-scheme=(light|dark)(?:;|$)/)
  return match === null ? null : match[1]
}

function serveManifest(ctx, tokens, base, icon) {
  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    const preference = currentPreference(ctx)
    // Manifest has no per-scheme colors. Explicit prefs are exact; `system`
    // resolves through the scheme the browser reported in the cookie, then the
    // Sec-CH-Prefers-Color-Scheme client hint when it is sent, else light.
    const reported = cookieScheme(req) ?? req.headers?.['sec-ch-prefers-color-scheme']
    const color = preference === 'dark' || (preference !== 'light' && reported === 'dark')
      ? tokens.dark
      : tokens.light
    const icons = icon === null
      ? base.icons
      : [{ src: ICON_PATH, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
    // Only embed the token for authenticated requests. `connection` exists only
    // on dsh >= 0.1.2-alpha.1; it is read defensively (not injected) so that
    // 0.1.1-rc2, where the service is absent, still loads and serves the plain
    // start_url.
    let startUrl = base.start_url
    const conn = connectionOf(ctx)
    if (conn && conn.requestRejection?.(req) === undefined) {
      const token = new URL(conn.authenticatedUrl('http://localhost')).searchParams.get('token')
      if (typeof token === 'string') startUrl = `/?token=${token}`
    }
    const body = JSON.stringify({
      ...base,
      display: 'standalone',
      theme_color: color,
      background_color: color,
      start_url: startUrl,
      icons,
    }, null, 2)
    res.writeHead(200, {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'no-cache',
    })
    res.end(body)
  }
}

function serveIcon(svg) {
  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    res.writeHead(200, {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'no-cache',
    })
    res.end(svg)
  }
}

// `connection` (and its one-time launch token) only exists on dsh >= 0.1.2-alpha.1.
// It is intentionally not injected: a required inject would stop this plugin from
// loading on 0.1.1-rc2, where the service is absent. Read it defensively so an
// absent service degrades to "no token" instead of throwing.
function connectionOf(ctx) {
  try { return ctx.connection } catch { return null }
}

export const name = '@jiesou/dsh-webui-fix-pwa'
export const inject = ['settings', 'webServer']

// DSH only mints the session cookie via the one-time token URL (`GET /?token=…`),
// so the token gate stays. A desktop PWA launching straight at that URL loses
// the cookie and hangs, so we only embed the token in `start_url` for
// authenticated requests; unauthenticated LAN clients fetching the manifest
// see no token. On 0.1.1-rc2 `connection` is absent, so the plain `start_url`
// is served and the PWA relies on the older auth flow.

export function apply(ctx) {
  const tokens = designTokens()
  const base = manifestBase()
  const icon = pwaIconSvg()
  ctx.effect(
    () => ctx.webServer.tapIndex((html) => injectThemeColorMetas(html, tokens.light, tokens.dark, currentPreference(ctx))),
    'dsh-webui-fix-pwa: theme-color meta injection',
  )
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: '/manifest.webmanifest',
      handler: serveManifest(ctx, tokens, base, icon),
    }),
    'dsh-webui-fix-pwa: patched manifest route',
  )
  if (icon !== null) {
    ctx.effect(
      () => ctx.webServer.register({
        kind: 'exact',
        path: ICON_PATH,
        handler: serveIcon(icon),
      }),
      'dsh-webui-fix-pwa: PWA icon route',
    )
  }
}