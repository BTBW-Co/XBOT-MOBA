// Credencial de contato; nunca é uma sessão administrativa da plataforma.
// localStorage mantém o telefone vinculado depois que a aba fecha.
const KEY = 'moba_verified_visitor'

function readStored() {
  try {
    const local = localStorage.getItem(KEY)
    if (local) return local
  } catch { /* storage indisponível */ }
  try {
    return sessionStorage.getItem(KEY)
  } catch { return null }
}

function writeStored(raw) {
  try { localStorage.setItem(KEY, raw) } catch { /* segue na sessão */ }
  try { sessionStorage.setItem(KEY, raw) } catch { /* ignore */ }
}

function clearStored() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}

export function readVisitorIdentity() {
  try {
    const value = JSON.parse(readStored() || 'null')
    if (!value || value.expiresAt <= Date.now() || !/^ext_mv_[A-Za-z0-9_-]{32}$/.test(value.visitor_id)) return null
    return value
  } catch { return null }
}
export function storeVisitorIdentity(data, objectRef) {
  const value = { ...data, objectRef, expiresAt: Date.now() + data.expires_in * 1000 }
  writeStored(JSON.stringify(value))
}

export function installVisitorIdentityExpiry() {
  if (window.__mobaVisitorExpiryInstalled) return
  const original = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const response = await original(input, init)
    const url = typeof input === 'string' ? input : input?.url || ''
    if (url.includes('/v1/xchat/') && response.status === 401) {
      let identity
      try { identity = JSON.parse(readStored() || 'null') } catch { identity = null }
      if (identity) {
        clearStored()
        window.location.replace(`/?object_id=${encodeURIComponent(identity.objectRef)}`)
      }
    }
    return response
  }
  window.__mobaVisitorExpiryInstalled = true
}
