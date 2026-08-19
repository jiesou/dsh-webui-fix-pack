// Node half: patches the served PWA surface.
// - taps the index to inject light/dark media theme-color metas
// - intercepts /manifest.webmanifest and serves display=standalone plus
//   theme_color/background_color resolved from the theme design tokens.
// - serves a dedicated PWA icon: the original favicon on a white circle.
// The client half only removes the static metas after boot; dsh-client-ui-layout
// already owns the runtime theme-color meta from the computed body background.
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

function themeColorMetas(light, dark) {
  return [
    `<meta name="theme-color" ${META_ATTR} media="(prefers-color-scheme: light)" content="${light}" />`,
    `<meta name="theme-color" ${META_ATTR} media="(prefers-color-scheme: dark)" content="${dark}" />`,
  ].join('')
}

function injectThemeColorMetas(html, light, dark) {
  const metas = themeColorMetas(light, dark)
  const at = html.indexOf('</head>')
  if (at === -1) return `${html}${metas}`
  return `${html.slice(0, at)}${metas}${html.slice(at)}`
}

function readPreference(ctx) {
  return ctx.get('settings')?.get?.(THEME_SETTINGS_NAMESPACE)?.[THEME_PREFERENCE_FIELD] ?? DEFAULT_PREFERENCE
}

function manifestColors(preference, tokens) {
  return preference === 'dark'
    ? { theme_color: tokens.dark, background_color: tokens.dark }
    : { theme_color: tokens.light, background_color: tokens.light }
}

function serveManifest(ctx, tokens, base, icon) {
  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405)
      res.end()
      return
    }
    const colors = manifestColors(readPreference(ctx), tokens)
    const icons = icon === null
      ? base.icons
      : [{ src: ICON_PATH, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
    const body = JSON.stringify({ ...base, display: 'standalone', ...colors, icons }, null, 2)
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

export const name = '@jiesou/dsh-webui-fix-pwa'
export const inject = ['settings', 'webServer']

export function apply(ctx) {
  const tokens = designTokens()
  const base = manifestBase()
  const icon = pwaIconSvg()
  ctx.effect(
    () => ctx.webServer.tapIndex((html) => injectThemeColorMetas(html, tokens.light, tokens.dark)),
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