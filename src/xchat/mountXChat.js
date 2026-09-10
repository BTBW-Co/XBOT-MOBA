import { getXchatScriptUrl } from '../api/moba'

const FULLSCREEN_STYLE_ID = 'xbot-moba-fullscreen-css'

function injectFullscreenCss() {
  if (document.getElementById(FULLSCREEN_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = FULLSCREEN_STYLE_ID
  style.textContent = `
    /* MOBA hosted: só o XChat, tela cheia em qualquer viewport */
    html.moba-fullscreen,
    body.moba-fullscreen {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      background: #0b1220 !important;
    }
    body.moba-fullscreen #root {
      width: 100%;
      height: 100%;
    }
    body.moba-fullscreen .xbot-launcher,
    body.moba-fullscreen .xbot-welcome-teaser,
    body.moba-fullscreen #xbot-lazy-stub {
      display: none !important;
      pointer-events: none !important;
    }
    body.moba-fullscreen .xbot-chatbox,
    body.moba-fullscreen .xbot-chatbox.is-open,
    body.moba-fullscreen .xbot-chatbox.is-open:not(.xbot-keyboard-open),
    body.moba-fullscreen .xbot-chatbox.xbot-keyboard-open {
      position: fixed !important;
      inset: 0 !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      height: 100dvh !important;
      max-height: none !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      opacity: 1 !important;
      transform: none !important;
      display: flex !important;
      pointer-events: auto !important;
      z-index: 2147483001 !important;
    }
    body.moba-fullscreen .xbot-header-minimize {
      display: none !important;
    }
  `
  document.head.appendChild(style)
}

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
 * Monta o XChat em modo fullscreen (única UI do MOBA).
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

  injectFullscreenCss()
  document.documentElement.classList.add('moba-fullscreen')
  document.body.classList.add('moba-xchat-live', 'moba-fullscreen')

  await loadScript(scriptUrl)
  await waitFor(() => typeof window.initXBot === 'function')

  const context = {
    ...(bootstrap.context || {}),
    object_id: bootstrap.object_id,
    channel: 'moba',
    source: 'moba',
    pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  }
  if (bootstrap.moba_context && typeof bootstrap.moba_context === 'object') {
    context.moba = bootstrap.moba_context
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
  ;[200, 600, 1200].forEach((ms) => {
    setTimeout(() => {
      if (typeof window.openXBot === 'function') window.openXBot()
      const box = document.querySelector('.xbot-chatbox')
      if (box) {
        box.classList.add('is-open', 'is-visible')
      }
    }, ms)
  })
}
