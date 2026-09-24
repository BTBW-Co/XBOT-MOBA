import { getXchatScriptUrl } from '../api/moba'
import {
  applyMobaBackground,
  writeCachedMobaAppearance,
} from '../lib/mobaBackground'

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
    body.moba-fullscreen.moba-has-bg .moba-boot {
      background: transparent;
    }

    body.moba-fullscreen .xbot-launcher,
    body.moba-fullscreen .xbot-welcome-teaser,
    body.moba-fullscreen #xbot-lazy-stub {
      display: none !important;
      pointer-events: none !important;
    }

    body.moba-fullscreen .xbot-chatbox,
    body.moba-fullscreen .xbot-chatbox.is-open,
    body.moba-fullscreen .xbot-chatbox.is-open:not(.xbot-keyboard-open) {
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
    /* Teclado aberto: top/height vêm do visualViewport (JS). Não forçar inset/100dvh. */
    body.moba-fullscreen .xbot-chatbox.xbot-keyboard-open {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      bottom: auto !important;
      width: 100% !important;
      max-width: 100% !important;
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
    body.moba-fullscreen .xbot-chatbox.xbot-keyboard-open .xbot-compose {
      padding-bottom: 6px !important;
    }

    /* Header flutuante (inset + cantos arredondados) */
    body.moba-fullscreen .xbot-header {
      width: auto !important;
      max-width: none !important;
      align-self: stretch !important;
      min-height: 56px !important;
      height: auto !important;
      margin: max(8px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) 0
        max(10px, env(safe-area-inset-left)) !important;
      padding: 10px 14px !important;
      background: rgba(255, 255, 255, 0.92) !important;
      border: 0 !important;
      border-bottom: 0 !important;
      border-radius: 18px !important;
      backdrop-filter: blur(14px) saturate(1.2);
      -webkit-backdrop-filter: blur(14px) saturate(1.2);
      gap: 12px !important;
      box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.04),
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.06) !important;
      flex-shrink: 0 !important;
      z-index: 20 !important;
    }
    @media (min-width: 768px) {
      body.moba-fullscreen .xbot-header {
        margin-left: 16px !important;
        margin-right: 16px !important;
        margin-top: max(12px, env(safe-area-inset-top)) !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
        border-radius: 20px !important;
      }
    }
    body.moba-fullscreen .xbot-header > img,
    body.moba-fullscreen .xbot-header .xbot-header-avatar img {
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
    body.moba-fullscreen .xbot-moba-brand-logo {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      margin-left: auto;
      font-family: 'Geom', sans-serif;
      font-weight: 600;
      font-size: 21px;
      line-height: 1;
      letter-spacing: -0.04em;
      text-transform: lowercase;
      color: #1a1a18;
      pointer-events: none;
      user-select: none;
    }

    /* Mensagens: coluna sempre centralizada (~40–48rem) */
    body.moba-fullscreen .xbot-messages {
      flex: 1 1 auto !important;
      background: #ffffff !important;
      padding: 24px 0 32px !important;
      gap: 18px !important;
      align-items: center !important;
      justify-content: flex-start !important;
      /* Scroll invisível (gesto/roda do mouse seguem funcionando) */
      scrollbar-width: none !important; /* Firefox */
      -ms-overflow-style: none !important; /* Legacy Edge */
    }
    body.moba-fullscreen .xbot-messages::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
    }
    body.moba-fullscreen .xbot-chatbox,
    body.moba-fullscreen .xbot-chatbox * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    body.moba-fullscreen .xbot-chatbox::-webkit-scrollbar,
    body.moba-fullscreen .xbot-chatbox *::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
    }
    /* Fundo de marca nas laterais (imagem + opacidade do canal) */
    body.moba-fullscreen.moba-has-bg .xbot-chatbox {
      isolation: isolate;
    }
    body.moba-fullscreen.moba-has-bg .xbot-chatbox::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      background-image: var(--moba-bg-image);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: var(--moba-bg-opacity, 0.12);
      pointer-events: none;
    }
    body.moba-fullscreen.moba-has-bg .xbot-header,
    body.moba-fullscreen.moba-has-bg .xbot-messages,
    body.moba-fullscreen.moba-has-bg .xbot-compose,
    body.moba-fullscreen.moba-has-bg .xbot-footer {
      position: relative;
      z-index: 1;
    }
    body.moba-fullscreen.moba-has-bg .xbot-messages {
      background: transparent !important;
    }
    body.moba-fullscreen.moba-has-bg .xbot-chatbox {
      background: #ffffff !important;
    }
    body.moba-fullscreen.moba-has-bg .xbot-footer {
      background: transparent !important;
    }
    /* Estado inicial (empty / welcome): também centraliza na vertical acima do composer */
    body.moba-fullscreen .xbot-messages:not(:has(.xbot-message-row.user)) {
      justify-content: center !important;
      justify-content: safe center !important;
    }
    body.moba-fullscreen .xbot-messages > * {
      width: 100% !important;
      max-width: 40rem !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      box-sizing: border-box !important;
      align-self: center !important;
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
      width: 100% !important;
      margin: 0 auto !important;
      padding: 0 16px !important;
      text-align: center !important;
    }
    body.moba-fullscreen .xbot-empty-text {
      color: #737373 !important;
      font-size: 15px !important;
      text-align: center !important;
    }
    /* Welcome (só bot, sem user): esconde timestamp; coluna já é a do composer */
    body.moba-fullscreen .xbot-messages:not(:has(.xbot-message-row.user)) .xbot-message.bot .xbot-time {
      display: none !important;
    }

    body.moba-fullscreen .xbot-message-row {
      max-width: 40rem !important;
      gap: 8px !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-message-row {
        max-width: 48rem !important;
      }
    }
    body.moba-fullscreen .xbot-message-row.bot {
      max-width: 40rem !important;
      align-self: center !important;
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-message-row.bot {
        max-width: 48rem !important;
      }
    }
    body.moba-fullscreen .xbot-message-row.user {
      max-width: 40rem !important;
      align-self: center !important;
      justify-content: flex-end !important;
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-message-row.user {
        max-width: 48rem !important;
      }
    }
    body.moba-fullscreen .xbot-msg-avatar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      overflow: hidden !important;
    }
    body.moba-fullscreen .xbot-message-row.bot {
      gap: 0 !important;
    }
    body.moba-fullscreen .xbot-message-row.bot,
    body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .xbot-message-row.bot,
      body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-message-row.bot,
      body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
        padding-left: 4rem !important;
        padding-right: 4rem !important;
      }
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
    body.moba-fullscreen .xbot-message-row--link,
    body.moba-fullscreen .xbot-message-row--link .xbot-message-col,
    body.moba-fullscreen .xbot-message-row--link .xbot-message.bot,
    body.moba-fullscreen .xbot-message-row--link .xbot-text {
      width: 100% !important;
      max-width: 100% !important;
      align-items: stretch !important;
    }
    body.moba-fullscreen .xbot-link-card {
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 14px 16px !important;
      border: 1px solid #e5e5e5 !important;
      border-radius: 14px !important;
      background: #fafafa !important;
      color: #0d0d0d !important;
      text-decoration: none !important;
      border-bottom: 1px solid #e5e5e5 !important;
    }
    body.moba-fullscreen .xbot-link-card:hover {
      opacity: 1 !important;
      border-color: #d4d4d4 !important;
      background: #f5f5f5 !important;
    }
    body.moba-fullscreen .xbot-link-card-kicker {
      font-size: 11px !important;
      font-weight: 650 !important;
      letter-spacing: 0.04em !important;
      text-transform: uppercase !important;
      color: #8e8e8e !important;
    }
    body.moba-fullscreen .xbot-link-card-title {
      font-size: 16px !important;
      font-weight: 650 !important;
      line-height: 1.35 !important;
      color: #0d0d0d !important;
    }
    body.moba-fullscreen .xbot-link-card-url {
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #1967d2 !important;
    }
    /* Fallback: mensagem que é só um <a> (widget antigo) ocupa a mesma coluna */
    body.moba-fullscreen .xbot-message.bot .xbot-text:has(> p:only-child > a:only-child) {
      width: 100% !important;
    }
    body.moba-fullscreen .xbot-message.bot .xbot-text:has(> p:only-child > a:only-child) > p {
      margin: 0 !important;
    }
    body.moba-fullscreen .xbot-message.bot .xbot-text:has(> p:only-child > a:only-child) a {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 14px 16px !important;
      border: 1px solid #e5e5e5 !important;
      border-radius: 14px !important;
      background: #fafafa !important;
      color: #0d0d0d !important;
      font-weight: 650 !important;
      text-decoration: none !important;
      border-bottom: 1px solid #e5e5e5 !important;
      overflow-wrap: anywhere !important;
    }
    body.moba-fullscreen .xbot-text,
    body.moba-fullscreen .xbot-text p,
    body.moba-fullscreen .xbot-text li,
    body.moba-fullscreen .xbot-text span:not(.xbot-presentation-unmute) {
      font-size: 16px !important;
      line-height: 1.625 !important;
    }
    body.moba-fullscreen .xbot-text p {
      margin: 0 0 0.75em !important;
    }
    body.moba-fullscreen .xbot-text p:last-child {
      margin-bottom: 0 !important;
    }
    body.moba-fullscreen .xbot-presentation-video {
      width: 100% !important;
      max-width: 100% !important;
      margin: 4px 0 8px !important;
    }
    body.moba-fullscreen .xbot-presentation-video video {
      width: 100% !important;
      margin: 0 !important;
    }
    body.moba-fullscreen .xbot-presentation-unmute {
      font-size: clamp(20px, 6.2vw, 30px) !important;
      line-height: 1.15 !important;
      font-weight: 800 !important;
      letter-spacing: 0.1em !important;
      color: #fff !important;
      animation: xbot-unmute-breathe 1.7s ease-in-out infinite !important;
    }
    @media (min-width: 768px) {
      body.moba-fullscreen .xbot-presentation-unmute {
        font-size: clamp(48px, 5.4vw, 72px) !important;
        letter-spacing: 0.12em !important;
      }
    }
    @keyframes xbot-unmute-breathe {
      0%, 100% { opacity: 0.28; }
      50% { opacity: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      body.moba-fullscreen .xbot-presentation-unmute {
        animation: none !important;
        opacity: 1 !important;
      }
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
      padding: 8px 16px 4px !important;
      padding-bottom: 4px !important;
      margin-bottom: 5px !important;
      display: flex !important;
      justify-content: center !important;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .xbot-compose {
        padding-left: 24px !important;
        padding-right: 24px !important;
        padding-bottom: 4px !important;
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
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      padding: 6px 16px max(14px, env(safe-area-inset-bottom)) !important;
      background: #ffffff !important;
      border-top: 0 !important;
    }
    /* Garante que o hide do teclado vença o display:flex acima */
    body.moba-fullscreen .xbot-chatbox.xbot-keyboard-open .xbot-footer {
      display: none !important;
      padding: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
    }
    body.moba-fullscreen .xbot-powered {
      font-size: 12px !important;
      color: #8e8e8e !important;
      text-decoration: none !important;
      letter-spacing: 0.01em;
    }
    body.moba-fullscreen .xbot-powered strong {
      color: #52524c !important;
      font-weight: 600 !important;
    }
    body.moba-fullscreen .xbot-powered:hover strong {
      color: #1967d2 !important;
    }

    body.moba-fullscreen .xbot-inactivity-bar {
      max-width: 40rem !important;
      margin: 0 auto !important;
      border-radius: 12px !important;
    }
    body.moba-fullscreen .xbot-ui-blocks {
      max-width: 100%;
    }
    body.moba-fullscreen .xbot-recap,
    body.moba-fullscreen .xbot-choice-list {
      border-radius: 16px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    body.moba-fullscreen .xbot-choice-item {
      padding: 12px 10px !important;
    }
    body.moba-fullscreen .xbot-choice-label,
    body.moba-fullscreen .xbot-recap-item dd {
      font-size: 15px !important;
    }
    body.moba-fullscreen .xbot-step-progress {
      font-size: 13px !important;
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

function isTruthyQueryFlag(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

function isEmbeddedIframe() {
  try {
    return typeof window !== 'undefined' && window.self !== window.top
  } catch {
    return true
  }
}

function isDefaultMobaPath(pathname) {
  const path = String(pathname || '/')
    .replace(/\/+$/, '')
    .toLowerCase()
  return path === '' || path === '/'
}

/**
 * Demo da homepage (`?fresh=1` ou iframe do MOBA padrão): sessão nova a cada load
 * para a apresentação do Agent aparecer de novo. NFC/QR em tela cheia não entra aqui.
 */
export function shouldStartFreshSession({ search, pathname } = {}) {
  const loc = typeof window !== 'undefined' ? window.location : { search: '', pathname: '/' }
  const query = search != null ? search : loc.search || ''
  const path = pathname != null ? pathname : loc.pathname || '/'
  try {
    const params = new URLSearchParams(String(query).startsWith('?') ? query.slice(1) : query)
    if (isTruthyQueryFlag(params.get('fresh'))) return true
  } catch {
    /* ignore */
  }
  return isEmbeddedIframe() && isDefaultMobaPath(path)
}

const MOBA_PROMPT_MAX_LENGTH = 500

export function readMobaPromptQuery({ search } = {}) {
  const loc = typeof window !== 'undefined' ? window.location : { search: '' }
  const query = search != null ? search : loc.search || ''
  try {
    const params = new URLSearchParams(String(query).startsWith('?') ? query.slice(1) : query)
    return (params.get('q') || '').trim().slice(0, MOBA_PROMPT_MAX_LENGTH)
  } catch {
    return ''
  }
}

function applyMobaPromptToComposer(prompt) {
  const text = (prompt || '').trim()
  if (!text) return false
  const input = document.getElementById('xbot-input')
  const send = document.getElementById('xbot-send')
  if (!input || !send || input.dataset.mobaPromptSent === '1') return false
  const compose = document.querySelector('.xbot-compose')
  if (compose && compose.classList.contains('is-presentation-locked')) {
    if (input.dataset.mobaPromptWait === '1') return false
    input.dataset.mobaPromptWait = '1'
    const onUnlock = () => {
      document.removeEventListener('xbot:compose-unlocked', onUnlock)
      applyMobaPromptToComposer(text)
    }
    document.addEventListener('xbot:compose-unlocked', onUnlock)
    return false
  }
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  send.click()
  input.dataset.mobaPromptSent = '1'
  return true
}

export function startFreshVisitorId() {
  try {
    localStorage.removeItem('xbot_visitor_id')
  } catch {
    /* ignore */
  }
  try {
    const stale = []
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('xbot_welcome_delivered_')) stale.push(key)
    }
    stale.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}

/** Wordmark Xbot (mesmo do site) no canto superior direito do header — só marca, sem link. */
function renderBrandLogo() {
  const header = document.querySelector('.xbot-chatbox .xbot-header')
  if (!header) return false
  if (header.querySelector('.xbot-moba-brand-logo')) return true

  const mark = document.createElement('span')
  mark.className = 'xbot-moba-brand-logo'
  mark.setAttribute('aria-hidden', 'true')
  mark.textContent = 'xbot'

  const minimize = header.querySelector('.xbot-header-minimize')
  if (minimize) header.insertBefore(mark, minimize)
  else header.appendChild(mark)
  return true
}

function ensureBrandLogo({ attempts = 12, intervalMs = 250 } = {}) {
  if (renderBrandLogo()) return
  let left = attempts
  const timer = setInterval(() => {
    left -= 1
    if (renderBrandLogo() || left <= 0) clearInterval(timer)
  }, intervalMs)
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

  const widget = xchat.widget || {}
  // Fundo + preload antes do script: o visitante vê a marca enquanto o XChat baixa.
  applyMobaBackground(widget)
  writeCachedMobaAppearance(bootstrap.public_code || bootstrap.object_id, widget)

  injectFullscreenCss()
  document.documentElement.classList.add('moba-fullscreen')
  document.body.classList.add('moba-xchat-live', 'moba-fullscreen')

  await loadScript(scriptUrl)
  await waitFor(() => typeof window.initXBot === 'function')

  const freshSession = shouldStartFreshSession()
  if (freshSession) {
    startFreshVisitorId()
  }

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

  const initConfig = {
    channelId,
    token,
    apiBaseUrl,
    context,
    botName: widget.bot_name || bootstrap.display_name || 'Xbot',
    botAvatar: widget.bot_avatar_url,
    themeColor: widget.theme_color || '#0073ea',
    welcomeMessage: widget.welcome_message || undefined,
    // Notificação nativa do browser + som do app ao receber mensagem do bot.
    browserNotify: true,
  }
  if (freshSession) {
    initConfig.user = {
      externalUserId: `moba_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    }
  }
  window.initXBot(initConfig)

  if (typeof window.setXBotContext === 'function') {
    window.setXBotContext(context)
  }

  await waitFor(() => typeof window.openXBot === 'function')
  window.openXBot()
  ensureBrandLogo()
  const heroPrompt = readMobaPromptQuery()
  ;[400, 1500, 4000].forEach((ms) => {
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
      if (heroPrompt) applyMobaPromptToComposer(heroPrompt)
      ensureBrandLogo()
    }, ms)
  })
}
