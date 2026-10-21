// Credencial de contato; nunca é uma sessão administrativa da plataforma.
const KEY = 'moba_verified_visitor'
export function readVisitorIdentity() {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    if (!value || value.expiresAt <= Date.now() || !/^ext_mv_[A-Za-z0-9_-]{32}$/.test(value.visitor_id)) return null
    return value
  } catch { return null }
}
export function storeVisitorIdentity(data, objectRef) {
  const value = { ...data, objectRef, expiresAt: Date.now() + data.expires_in * 1000 }
  sessionStorage.setItem(KEY, JSON.stringify(value))
}

export function installVisitorIdentityExpiry() {
  if (window.__mobaVisitorExpiryInstalled) return
  const original = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const response = await original(input, init)
    const url = typeof input === 'string' ? input : input?.url || ''
    if (url.includes('/v1/xchat/') && response.status === 401) {
      let identity
      try { identity = JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { identity = null }
      if (identity) {
        sessionStorage.removeItem(KEY)
        window.location.replace(`/?object_id=${encodeURIComponent(identity.objectRef)}`)
      }
    }
    return response
  }
  window.__mobaVisitorExpiryInstalled = true
}
