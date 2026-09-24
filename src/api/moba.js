const DEFAULT_API = 'https://api.xbotone.com'
const DEFAULT_SCRIPT = 'https://xbotone.com/xchat/xbot.min.js'

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API).replace(/\/$/, '')
}

export function getXchatScriptUrl() {
  return (import.meta.env.VITE_XCHAT_SCRIPT_URL || DEFAULT_SCRIPT).trim()
}

/**
 * @param {{ objectId?: string | null, pin?: string | null }} opts
 */
export async function bootstrapMoba({ objectId, pin } = {}) {
  const api = getApiBaseUrl()
  const params = new URLSearchParams()
  if (objectId) params.set('object_id', objectId)
  if (pin) params.set('pin', pin)
  const qs = params.toString()
  // Sempre via /bootstrap: aceita UUID legado e public_code curto.
  const url = `${api}/v1/public/moba/bootstrap${qs ? `?${qs}` : ''}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail || detail
    } catch {
      /* ignore */
    }
    const err = new Error(typeof detail === 'string' ? detail : `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/**
 * @param {{ objectId?: string | null, pin: string }} opts
 */
export async function unlockMoba({ objectId, pin } = {}) {
  const api = getApiBaseUrl()
  const res = await fetch(`${api}/v1/public/moba/unlock`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      object_id: objectId || null,
      pin,
    }),
  })
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail || detail
    } catch {
      /* ignore */
    }
    const err = new Error(typeof detail === 'string' ? detail : `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}
