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
export async function bootstrapMoba({ objectId, pin, displayLang } = {}) {
  const api = getApiBaseUrl()
  const params = new URLSearchParams()
  if (objectId) params.set('object_id', objectId)
  if (pin) params.set('pin', pin)
  if (displayLang) params.set('display_lang', displayLang)
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
export async function unlockMoba({ objectId, pin, displayLang } = {}) {
  const api = getApiBaseUrl()
  const res = await fetch(`${api}/v1/public/moba/unlock`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      object_id: objectId || null,
      pin,
      display_lang: displayLang || null,
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

async function postOnboarding(path, body) {
  const api = getApiBaseUrl()
  const res = await fetch(`${api}/v1/public/moba/${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  })
  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  if (!res.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : ''
    const err = new Error(detail || `HTTP ${res.status}`)
    err.status = res.status
    err.detail = detail
    throw err
  }
  return data
}

export function fetchPhoneOptions() {
  const api = getApiBaseUrl()
  return fetch(`${api}/v1/public/moba/phone/options`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}))
      return res.ok && data?.whatsapp === true ? { whatsapp: true } : { whatsapp: false }
    })
    .catch(() => ({ whatsapp: false }))
}

export function startPhoneChallenge({ phone, locale, objectId, pin, turnstileToken, channel, inviteSlug }) {
  return postOnboarding('phone', {
    phone,
    locale: locale || null,
    object_id: objectId || null,
    pin: pin || null,
    turnstile_token: turnstileToken || null,
    channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
    invite_slug: inviteSlug || null,
  })
}

export function verifyPhoneChallenge({ phone, code, objectId, pin }) {
  return postOnboarding('phone/verify', { phone, code, object_id: objectId || null, pin: pin || null })
}

export function fetchPhoneSession({ visitorId, objectId, pin }) {
  return postOnboarding('phone/session', {
    visitor_id: visitorId,
    object_id: objectId || null,
    pin: pin || null,
  })
}

export function fetchInvite(slug) {
  const api = getApiBaseUrl()
  return fetch(`${api}/v1/public/moba/invite/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data?.detail || `HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return data
  })
}

export function savePhoneProfile(body) {
  return postOnboarding('phone/profile', body)
}

export function choosePersonalChannel({ visitorId, channel, objectId, pin }) {
  return postOnboarding('phone/channel', {
    visitor_id: visitorId,
    channel,
    object_id: objectId || null,
    pin: pin || null,
  })
}

export function fetchLeadSetup(token) {
  const api = getApiBaseUrl()
  return fetch(`${api}/v1/public/moba/setup/${encodeURIComponent(token)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data?.detail || `HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return data
  })
}

export function startLeadConnect(token, toolkit, { returnTo } = {}) {
  const body = { toolkit }
  if (returnTo) body.return_to = returnTo
  return postOnboarding(`setup/${encodeURIComponent(token)}/connect`, body)
}

export function connectLeadMeea(token, apiKey) {
  return postOnboarding(`setup/${encodeURIComponent(token)}/meea`, { api_key: apiKey })
}

export function deleteLeadAccount(token) {
  return postOnboarding(`setup/${encodeURIComponent(token)}/delete`, {})
}

export function completeLeadConnect(token, toolkit, { returnTo, bundle } = {}) {
  const body = { toolkit }
  if (returnTo) body.return_to = returnTo
  if (bundle) body.bundle = true
  return postOnboarding(`setup/${encodeURIComponent(token)}/complete`, body)
}

export async function fetchCurrentTerm() {
  const api = getApiBaseUrl()
  const res = await fetch(`${api}/v1/terms/current`, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  return res.json()
}
