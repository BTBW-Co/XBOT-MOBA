import { getXchatScriptUrl } from '../api/moba'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-xbot-moba-script="1"]`)
    if (existing && typeof window.initXBot === 'function') {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.dataset.xbotMobaScript = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Falha ao carregar XChat'))
    document.head.appendChild(s)
  })
}

function waitFor(fn, { timeoutMs = 15000, intervalMs = 50 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const tick = () => {
      try {
        if (fn()) {
          resolve()
          return
        }
      } catch {
        /* ignore */
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Timeout ao iniciar XChat'))
        return
      }
      setTimeout(tick, intervalMs)
    }
    tick()
  })
}

/**
 * Monta o XChat oficial (sem reimplementar chat).
 * @param {object} bootstrap — payload de /v1/public/moba/bootstrap
 */
export async function mountXChatFromBootstrap(bootstrap) {
  const xchat = bootstrap?.xchat || {}
  const auth = bootstrap?.auth || {}
  const channelId = xchat.channel_id || bootstrap.channel_id || bootstrap.object_id
  const token = auth.token
  const apiBaseUrl = (xchat.api_base_url || '').replace(/\/$/, '')
  const scriptUrl = xchat.script_cdn_url || getXchatScriptUrl()

  if (!channelId || !token) {
    throw new Error('Bootstrap incompleto (channel/token)')
  }

  await loadScript(scriptUrl)
  await waitFor(() => typeof window.initXBot === 'function')

  const context = {
    ...(bootstrap.context || {}),
    object_id: bootstrap.object_id,
    channel: 'moba',
    source: 'moba',
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  }

  window.initXBot({
    channelId,
    token,
    apiBaseUrl,
    context,
  })

  if (typeof window.setXBotContext === 'function') {
    window.setXBotContext(context)
  }

  await waitFor(() => typeof window.openXBot === 'function')
  window.openXBot()
}
