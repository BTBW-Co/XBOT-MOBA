const DEFAULT_API = 'https://api.xbotone.com'
const DEFAULT_SCRIPT = 'https://xbotone.com/xchat/xbot.min.js'

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API).replace(/\/$/, '')
}

export function getXchatScriptUrl() {
  return (import.meta.env.VITE_XCHAT_SCRIPT_URL || DEFAULT_SCRIPT).trim()
}

/**
 * @param {{ objectId?: string | null }} opts
 */
export async function bootstrapMoba({ objectId } = {}) {
  const api = getApiBaseUrl()
  const url = objectId
    ? `${api}/v1/public/moba/objects/${encodeURIComponent(objectId)}`
    : `${api}/v1/public/moba/bootstrap`
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
