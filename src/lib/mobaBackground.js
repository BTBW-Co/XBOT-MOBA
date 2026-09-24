const PRELOAD_ATTR = 'data-moba-bg-preload'
const CACHE_PREFIX = 'moba.appearance.'
/** Presign do widget dura 7 dias; cache local mais curto evita URL morta. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

function cssUrlValue(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  const safe = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '')
  return `url("${safe}")`
}

export function normalizeBackgroundOpacity(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0.12
  const opacity = n > 1 ? n / 100 : n
  if (opacity < 0.05 || opacity > 0.4) return 0.12
  return Math.round(opacity * 1000) / 1000
}

function appearanceCacheKey(ref) {
  const id = String(ref || '').trim()
  if (!id) return null
  return `${CACHE_PREFIX}${id}`
}

/**
 * Lê aparência cacheada (sessionStorage) para pintar o fundo antes do bootstrap.
 * @returns {{ background_url: string, background_opacity: number } | null}
 */
export function readCachedMobaAppearance(ref) {
  const key = appearanceCacheKey(ref)
  if (!key) return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const url = String(parsed?.background_url || '').trim()
    if (!url) return null
    const savedAt = Number(parsed?.saved_at) || 0
    if (savedAt && Date.now() - savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return {
      background_url: url,
      background_opacity: normalizeBackgroundOpacity(parsed?.background_opacity),
    }
  } catch {
    return null
  }
}

/** Persiste aparência do widget para a próxima abertura na mesma aba. */
export function writeCachedMobaAppearance(ref, widget) {
  const key = appearanceCacheKey(ref)
  if (!key) return
  const url = String(widget?.background_url || '').trim()
  try {
    if (!url) {
      sessionStorage.removeItem(key)
      return
    }
    sessionStorage.setItem(
      key,
      JSON.stringify({
        background_url: url,
        background_opacity: normalizeBackgroundOpacity(widget?.background_opacity),
        saved_at: Date.now(),
      }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

/** Dispara o download da imagem o quanto antes (preload + Image). */
export function preloadMobaBackground(url) {
  const href = String(url || '').trim()
  if (!href || typeof document === 'undefined') return

  let link = document.head.querySelector(`link[${PRELOAD_ATTR}="1"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.setAttribute(PRELOAD_ATTR, '1')
    document.head.appendChild(link)
  }
  if (link.href !== href) {
    link.href = href
  }

  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = href
  } catch {
    /* ignore */
  }
}

/**
 * Aplica CSS vars + classe no documento e pré-carrega a imagem.
 * Seguro chamar cedo (antes do XChat) e de novo no mount.
 */
export function applyMobaBackground(widget) {
  if (typeof document === 'undefined') return
  const url = String(widget?.background_url || '').trim()
  const root = document.documentElement
  const body = document.body
  if (!url) {
    body?.classList.remove('moba-has-bg')
    root.style.removeProperty('--moba-bg-image')
    root.style.removeProperty('--moba-bg-opacity')
    const link = document.head.querySelector(`link[${PRELOAD_ATTR}="1"]`)
    if (link) link.remove()
    return
  }
  const opacity = normalizeBackgroundOpacity(widget?.background_opacity)
  root.style.setProperty('--moba-bg-image', cssUrlValue(url))
  root.style.setProperty('--moba-bg-opacity', String(opacity))
  body?.classList.add('moba-has-bg')
  preloadMobaBackground(url)
}
