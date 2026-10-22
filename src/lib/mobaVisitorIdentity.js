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

export function rememberVisitorProfile(patch) {
  try {
    const current = JSON.parse(readStored() || 'null')
    if (!current?.visitor_id) return null
    const next = { ...current }
    ;['name', 'email', 'phone'].forEach((key) => {
      const value = String(patch?.[key] || '').trim()
      if (value) next[key] = value
    })
    if (Object.prototype.hasOwnProperty.call(patch || {}, 'invite_url')) {
      const invite = String(patch.invite_url || '').trim()
      if (invite) next.invite_url = invite
      else delete next.invite_url
    }
    writeStored(JSON.stringify(next))
    return next
  } catch {
    return null
  }
}

export function formatVisitorPhone(digits) {
  const value = String(digits || '').replace(/\D/g, '')
  if (!value) return ''
  if (value.startsWith('55') && (value.length === 12 || value.length === 13)) {
    const national = value.slice(4)
    const pretty = national.length === 9
      ? `${national.slice(0, 5)}-${national.slice(5)}`
      : `${national.slice(0, 4)}-${national.slice(4)}`
    return `+55 (${value.slice(2, 4)}) ${pretty}`
  }
  return `+${value}`
}

export function visitorDisplayLabel(identity) {
  const name = String(identity?.name || '').trim()
  if (name) return name
  const email = String(identity?.email || '').trim()
  if (email && !email.endsWith('@placeholder.local')) return email.split('@')[0] || email
  return formatVisitorPhone(identity?.phone)
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
        const ref = identity.objectRef
        const dest = !ref || ref === 'personal' ? '/' : `/?object_id=${encodeURIComponent(ref)}`
        window.location.replace(dest)
      }
    }
    return response
  }
  window.__mobaVisitorExpiryInstalled = true
}
