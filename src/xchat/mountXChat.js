import { getXchatScriptUrl } from '../api/moba'

const FULLSCREEN_STYLE_ID = 'xbot-moba-fullscreen-css'

function injectFullscreenCss() {
  if (document.getElementById(FULLSCREEN_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = FULLSCREEN_STYLE_ID
  style.textContent = `
    /* ── MOBA fullscreen: visual tipo chat “studio” (coluna central, header limpo) ── */
    html.moba-fullscreen,
    body.moba-fullscreen {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #262626 !important;
      font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif !important;
      -webkit-font-smoothing: antialiased;
    }
    body.moba-fullscreen #root {
      width: 100%;
      height: 100%;
      background: #fff;
    }
    body.moba-fullscreen .moba-boot {
      background: #fff;
    }
    body.moba-fullscreen .moba-boot p {
      color: #737373;
    }
    body.moba-fullscreen .moba-boot-dot {
      background: #1967d2;
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
      flex-direction: column !important;
      pointer-events: auto !important;
      z-index: 2147483001 !important;
      background: #ffffff !important;
      --xbot-theme: #1967d2;
      --xbot-theme-rgb: 25, 103, 210;
      --xbot-surface: #ffffff;
      --xbot-ink: #262626;
      --xbot-text: #262626;
      --xbot-muted: #737373;
      --xbot-subtle: #a3a39b;
      --xbot-border: #e8e8e3;
      --xbot-header-bg: rgba(255, 255, 255, 0.95);
    }

    /* Header limpo (~72px) */
    body.moba-fullscreen .xbot-header {
      min-height: 64px !important;
      height: auto !important;
      padding: 12px 16px 10px !important;
      padding-left: max(16px, env(safe-area-inset-left)) !important;
      padding-right: max(16px, env(safe-area-inset-right)) !important;
      background: rgba(255, 255, 255, 0.95) !important;
      border-bottom: 1px solid #ecece8 !important;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      gap: 12px !important;
      box-shadow: none !important;
      flex-shrink: 0 !important;
      z-index: 20 !important;
    }
    @media (min-width: 768px) {
      body.moba-fullscreen .xbot-header {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
    body.moba-fullscreen .xbot-header img {
      width: 42px !important;
      height: 42px !important;
      border-radius: 999px !important;
      object-fit: cover !important;
    }
    body.moba-fullscreen .xbot-header-name {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1a1a18 !important;
      letter-spacing: -0.01em !important;
    }
    body.moba-fullscreen .xbot-header-status {
      display: none !important;
    }
    body.moba-fullscreen .xbot-header-minimize {
      display: none !important;
    }
    body.moba-fullscreen .xbot-moba-session-code {
      flex-shrink: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: #52524c;
      background: #f3f3ef;
      border: 1px solid #e8e8e3;
      border-radius: 999px;
      padding: 6px 10px;
      margin-left: auto;
      user-select: all;
    }

    /* Mensagens: coluna central ~40rem (padrão ChatGPT) */
    body.moba-fullscreen .xbot-messages {
      flex: 1 1 auto !important;
      background: #ffffff !important;
      padding: 24px 0 32px !important;
      gap: 18px !important;
      align-items: stretch !important;
    }
    body.moba-fullscreen .xbot-messages > * {
      width: 100% !important;
      max-width: 40rem !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      box-sizing: border-box !important;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .xbot-messages > * {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-messages > * {
        max-width: 48rem !important;
        padding-left: 4rem !important;
        padding-right: 4rem !important;
      }
    }
    body.moba-fullscreen .xbot-empty {
      max-width: 40rem !important;
      margin: 0 auto !important;
      padding: 0 16px !important;
    }
    body.moba-fullscreen .xbot-empty-text {
      color: #737373 !important;
      font-size: 15px !important;
    }

    body.moba-fullscreen .xbot-message-row {
      max-width: 100% !important;
      gap: 8px !important;
      width: 100% !important;
    }
    body.moba-fullscreen .xbot-message-row.bot {
      max-width: 100% !important;
      align-self: stretch !important;
    }
    body.moba-fullscreen .xbot-message-row.user {
      max-width: 100% !important;
      justify-content: flex-end !important;
    }
    body.moba-fullscreen .xbot-msg-avatar {
      display: none !important;
    }
    body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
      padding-left: 0 !important;
    }
    body.moba-fullscreen .xbot-message-row.bot .xbot-message-col {
      width: 100% !important;
      max-width: 100% !important;
      align-items: stretch !important;
    }
    body.moba-fullscreen .xbot-message-row.user .xbot-message-col {
      max-width: 70% !important;
      align-items: flex-end !important;
    }

    /* Usuário = pill; assistente = prosa sem bolha (ChatGPT) */
    body.moba-fullscreen .xbot-message {
      font-size: 16px !important;
      line-height: 1.5 !important;
      border: 0 !important;
      box-shadow: none !important;
    }
    body.moba-fullscreen .xbot-message.user {
      background: #f4f4f4 !important;
      color: #0d0d0d !important;
      padding: 10px 16px !important;
      border-radius: 22px !important;
      max-width: 100% !important;
    }
    body.moba-fullscreen .xbot-message.user a {
      color: #1967d2 !important;
    }
    body.moba-fullscreen .xbot-message.bot {
      background: transparent !important;
      color: #0d0d0d !important;
      padding: 0 !important;
      border-radius: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
    }
    body.moba-fullscreen .xbot-text,
    body.moba-fullscreen .xbot-text p,
    body.moba-fullscreen .xbot-text li,
    body.moba-fullscreen .xbot-text span {
      font-size: 16px !important;
      line-height: 1.625 !important;
    }
    body.moba-fullscreen .xbot-text p {
      margin: 0 0 0.75em !important;
    }
    body.moba-fullscreen .xbot-text p:last-child {
      margin-bottom: 0 !important;
    }
    body.moba-fullscreen .xbot-text code {
      background: #f5f5f5 !important;
      color: #333 !important;
      border-radius: 5px !important;
      padding: 0 4px !important;
      font-weight: 300 !important;
    }
    body.moba-fullscreen .xbot-time {
      color: #8e8e8e !important;
      font-size: 11px !important;
    }
    body.moba-fullscreen .xbot-message.bot .xbot-time {
      opacity: 0.7;
    }
    body.moba-fullscreen .xbot-typing {
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      padding: 0 !important;
    }

    /* Composer cápsula central */
    body.moba-fullscreen .xbot-compose {
      background: transparent !important;
      border-top: 0 !important;
      padding: 8px 16px 8px !important;
      padding-bottom: max(8px, env(safe-area-inset-bottom)) !important;
      display: flex !important;
      justify-content: center !important;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .xbot-compose {
        padding-left: 24px !important;
        padding-right: 24px !important;
        padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
      }
    }
    body.moba-fullscreen .xbot-compose-inner {
      width: 100% !important;
      max-width: 40rem !important;
      border: 0 !important;
      border-radius: 28px !important;
      background: #f4f4f4 !important;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04) !important;
      padding: 6px 8px 6px 10px !important;
      gap: 4px !important;
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-compose-inner {
        max-width: 48rem !important;
      }
    }
    body.moba-fullscreen .xbot-compose-inner:focus-within {
      box-shadow: 0 1px 2px rgba(26, 26, 24, 0.06), 0 0 0 3px rgba(25, 103, 210, 0.12) !important;
    }
    body.moba-fullscreen .xbot-icon-btn {
      width: 40px !important;
      height: 40px !important;
      color: #3a3a36 !important;
    }
    body.moba-fullscreen .xbot-icon-btn:hover {
      background: rgba(0, 0, 0, 0.06) !important;
    }
    body.moba-fullscreen .xbot-input {
      font-size: 16px !important;
      line-height: 1.5 !important;
      padding: 8px 6px !important;
      color: #0d0d0d !important;
    }
    body.moba-fullscreen .xbot-input::placeholder {
      color: #8e8e8e !important;
    }
    body.moba-fullscreen .xbot-send {
      width: 40px !important;
      height: 40px !important;
      background: #0d0d0d !important;
      color: #ffffff !important;
      border-radius: 999px !important;
    }
    body.moba-fullscreen .xbot-send:hover {
      background: #2a2a2a !important;
      color: #ffffff !important;
    }
    body.moba-fullscreen .xbot-send svg {
      stroke: #ffffff !important;
      color: #ffffff !important;
    }

    body.moba-fullscreen .xbot-footer {
      display: none !important;
    }

    body.moba-fullscreen .xbot-inactivity-bar {
      max-width: 40rem !important;
      margin: 0 auto !important;
      border-radius: 12px !important;
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

function readVisitorId() {
  try {
    return (localStorage.getItem('xbot_visitor_id') || '').trim()
  } catch {
    return ''
  }
}

function renderSessionCodeBadge(code) {
  const header = document.querySelector('.xbot-chatbox .xbot-header')
  if (!header || !code) return
  let badge = header.querySelector('.xbot-moba-session-code')
  if (!badge) {
    badge = document.createElement('button')
    badge.type = 'button'
    badge.className = 'xbot-moba-session-code'
    badge.title = 'Código da sessão — copie para localizar no Chat'
    badge.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code)
        badge.dataset.copied = '1'
        badge.textContent = 'Copiado'
        setTimeout(() => {
          badge.dataset.copied = ''
          badge.textContent = code
        }, 1200)
      } catch {
        /* ignore */
      }
    })
    const minimize = header.querySelector('.xbot-header-minimize')
    if (minimize) header.insertBefore(badge, minimize)
    else header.appendChild(badge)
  }
  if (badge.dataset.copied !== '1') badge.textContent = code
}

async function pollSessionCode({ apiBaseUrl, channelId, token }) {
  const base = (apiBaseUrl || '').replace(/\/$/, '')
  if (!base || !channelId || !token) return null
  const visitorId = readVisitorId()
  if (!visitorId) return null
  const url =
    `${base}/v1/xchat/history?channel_id=${encodeURIComponent(channelId)}` +
    `&visitor_id=${encodeURIComponent(visitorId)}&limit=1`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    const code = (data?.session_code || '').trim()
    if (code) {
      renderSessionCodeBadge(code)
      return code
    }
  } catch {
    /* ignore */
  }
  return null
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

  const widget = xchat.widget || {}
  window.initXBot({
    channelId,
    token,
    apiBaseUrl,
    context,
    botName: widget.bot_name || bootstrap.display_name || 'Xbot',
    botAvatar: widget.bot_avatar_url,
    themeColor: widget.theme_color || '#1967d2',
    welcomeMessage: widget.welcome_message || undefined,
  })

  if (typeof window.setXBotContext === 'function') {
    window.setXBotContext(context)
  }

  await waitFor(() => typeof window.openXBot === 'function')
  window.openXBot()
  ;[200, 600, 1200, 2500, 5000].forEach((ms) => {
    setTimeout(() => {
      if (typeof window.openXBot === 'function') window.openXBot()
      const box = document.querySelector('.xbot-chatbox')
      if (box) {
        box.classList.add('is-open', 'is-visible')
      }
      const input = document.getElementById('xbot-input')
      if (input && !input.dataset.mobaPh) {
        input.placeholder = 'Pergunte qualquer coisa'
        input.dataset.mobaPh = '1'
      }
      void pollSessionCode({ apiBaseUrl, channelId, token })
    }, ms)
  })

  // Após a primeira mensagem o código passa a existir com certeza.
  document.addEventListener(
    'click',
    () => {
      setTimeout(() => void pollSessionCode({ apiBaseUrl, channelId, token }), 800)
    },
    { passive: true },
  )
}
