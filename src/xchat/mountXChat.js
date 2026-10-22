import {
  readVisitorIdentity,
  installVisitorIdentityExpiry,
  rememberVisitorProfile,
  visitorDisplayLabel,
} from '../lib/mobaVisitorIdentity'
import { fetchPhoneSession, getXchatScriptUrl } from '../api/moba'
import {
  applyMobaBackground,
  writeCachedMobaAppearance,
} from '../lib/mobaBackground'
import {
  VISITOR_LOCALES,
  installDisplayLangFetch,
  installOperatorSessionFetch,
  normalizeVisitorLocale,
  readOperatorProfile,
  tLocale,
  writeExplicitLocale,
} from '../lib/visitorLocale'

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
      position: relative !important;
      overflow: visible !important;
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
      border-radius: 9999px !important;
      object-fit: cover !important;
      object-position: center !important;
    }
    body.moba-fullscreen .xbot-header-text {
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: flex-start !important;
      gap: 3px !important;
      min-width: 0 !important;
    }
    body.moba-fullscreen .xbot-header-name {
      font-family: "Geom", "DM Sans", sans-serif !important;
      font-size: 18px !important;
      font-weight: 600 !important;
      font-optical-sizing: auto !important;
      line-height: 1 !important;
      color: #161614 !important;
      letter-spacing: -0.045em !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 100% !important;
    }
    body.moba-fullscreen .xbot-header-role {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif !important;
      font-size: 12.5px !important;
      font-weight: 500 !important;
      font-style: italic !important;
      font-optical-sizing: auto !important;
      line-height: 1.15 !important;
      letter-spacing: 0.012em !important;
      color: #6e6962 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 100% !important;
    }
    body.moba-fullscreen .xbot-header-status {
      display: none !important;
    }
    body.moba-fullscreen .xbot-header-minimize {
      display: none !important;
    }
    body.moba-fullscreen .moba-locale--header {
      margin-left: auto;
      flex-shrink: 0;
    }
    body.moba-fullscreen .moba-locale--header select {
      appearance: none;
      border: 0;
      background: transparent;
      font: 500 13px/1 "DM Sans", ui-sans-serif, system-ui, sans-serif;
      color: #5c5852;
      padding: 6px 2px;
      cursor: pointer;
    }
    body.moba-fullscreen .moba-operator {
      position: relative;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      max-width: 56%;
      min-width: 0;
    }
    body.moba-fullscreen .moba-invite-share {
      width: 32px;
      height: 32px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #1c1c1c;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    body.moba-fullscreen .moba-invite-share:hover,
    body.moba-fullscreen .moba-invite-share[aria-expanded="true"] {
      background: #f3f1ee;
    }
    body.moba-fullscreen .moba-invite-popover {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      z-index: 30;
      width: min(320px, calc(100vw - 32px));
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: #ffffff;
      border: 1px solid #e6e2dc;
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(22, 22, 20, 0.12);
    }
    body.moba-fullscreen .moba-invite-popover[hidden] {
      display: none !important;
    }
    body.moba-fullscreen .moba-invite-title {
      margin: 0;
      font: 600 13px/1.2 "DM Sans", ui-sans-serif, system-ui, sans-serif;
      color: #161614;
    }
    body.moba-fullscreen .moba-invite-url {
      width: 100%;
      box-sizing: border-box;
      margin: 0;
      border: 1px solid #e6e2dc;
      border-radius: 10px;
      padding: 8px 10px;
      background: #faf9f7;
      color: #1c1c1c;
      font: 500 13px/1.3 "DM Sans", ui-sans-serif, system-ui, sans-serif;
    }
    body.moba-fullscreen .moba-invite-copy {
      border: 0;
      border-radius: 10px;
      background: #161614;
      color: #ffffff;
      font: 600 13px/1 "DM Sans", ui-sans-serif, system-ui, sans-serif;
      padding: 10px 12px;
      cursor: pointer;
    }
    body.moba-fullscreen .moba-operator-avatar {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: #111111;
      color: #ffffff;
      font: 600 12px/28px "DM Sans", ui-sans-serif, system-ui, sans-serif;
      text-align: center;
      flex-shrink: 0;
    }
    @media (max-width: 767px) {
      body.moba-fullscreen .moba-operator-avatar {
        display: none;
      }
    }
    body.moba-fullscreen .moba-operator-name {
      margin: 0;
      border: 0;
      background: transparent;
      padding: 4px 6px;
      border-radius: 8px;
      font: 500 13px/1.2 "DM Sans", ui-sans-serif, system-ui, sans-serif;
      color: #1c1c1c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    body.moba-fullscreen button.moba-operator-name {
      cursor: pointer;
    }
    body.moba-fullscreen button.moba-operator-name:hover,
    body.moba-fullscreen button.moba-operator-name[aria-expanded="true"] {
      background: #f3f1ee;
    }
    body.moba-fullscreen .xbot-moba-brand-logo {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      margin-left: 12px;
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
    body.moba-fullscreen.moba-thread-pending .xbot-messages {
      position: relative !important;
    }
    body.moba-fullscreen.moba-thread-pending .xbot-messages > :not(.moba-thread-skeleton) {
      visibility: hidden !important;
    }
    body.moba-fullscreen .xbot-chatbox > .moba-thread-skeleton {
      position: absolute !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 4 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-end !important;
      align-items: center !important;
      gap: 18px !important;
      width: auto !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 24px 0 32px !important;
      background: #ffffff !important;
      pointer-events: none !important;
      box-sizing: border-box !important;
    }
    body.moba-fullscreen .moba-thread-skeleton-row {
      display: flex !important;
      width: 100% !important;
      max-width: 40rem !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      box-sizing: border-box !important;
    }
    body.moba-fullscreen .moba-thread-skeleton-row.is-user {
      justify-content: flex-end !important;
    }
    body.moba-fullscreen .moba-thread-skeleton-bar {
      display: block;
      height: 52px;
      border-radius: 18px;
      background: linear-gradient(90deg, #eceae6 0%, #f7f6f4 42%, #eceae6 80%);
      background-size: 220% 100%;
      animation: moba-thread-skeleton 1.15s ease-in-out infinite;
    }
    body.moba-fullscreen .moba-thread-skeleton-row.is-bot .moba-thread-skeleton-bar {
      height: 68px;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .moba-thread-skeleton-row {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .moba-thread-skeleton-row {
        max-width: 48rem !important;
        padding-left: 4rem !important;
        padding-right: 4rem !important;
      }
    }
    @keyframes moba-thread-skeleton {
      0% { background-position: 100% 0; }
      100% { background-position: 0 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      body.moba-fullscreen .moba-thread-skeleton-bar {
        animation: none;
      }
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
      gap: 10px !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
      align-items: flex-start !important;
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
    /* Avatares no fio: circular + alinhados ao topo da 1ª mensagem. */
    body.moba-fullscreen .xbot-msg-avatar-wrap {
      display: inline-flex !important;
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      min-height: 32px !important;
      margin: 2px 0 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 9999px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
      background: #e8e8e3 !important;
    }
    body.moba-fullscreen .xbot-msg-avatar {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 9999px !important;
      object-fit: cover !important;
      object-position: center !important;
    }
    body.moba-fullscreen .xbot-message-row.bot {
      gap: 10px !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
    body.moba-fullscreen .xbot-message-row.user {
      gap: 10px !important;
    }
    /* Mensagens seguidas sem repetir avatar: alinha com o texto (32 + gap). */
    body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
      padding-left: 58px !important;
    }
    body.moba-fullscreen .xbot-message-row.user.xbot-message-row--no-avatar {
      padding-right: 58px !important;
    }
    @media (min-width: 640px) {
      body.moba-fullscreen .xbot-message-row.bot {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
        padding-left: 66px !important;
      }
    }
    @media (min-width: 1024px) {
      body.moba-fullscreen .xbot-message-row.bot {
        padding-left: 4rem !important;
        padding-right: 4rem !important;
      }
      body.moba-fullscreen .xbot-message-row.bot.xbot-message-row--no-avatar {
        padding-left: calc(4rem + 42px) !important;
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
    body.moba-fullscreen .xbot-message-row--share,
    body.moba-fullscreen .xbot-message-row--share .xbot-message-col,
    body.moba-fullscreen .xbot-message-row--share .xbot-message.bot,
    body.moba-fullscreen .xbot-message-row--share .xbot-text {
      width: 100% !important;
      max-width: 100% !important;
      align-items: stretch !important;
    }
    body.moba-fullscreen .xbot-share-block {
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 32px 14px 14px !important;
      border: 1px solid #e5e5e5 !important;
      border-radius: 14px !important;
      background: #f6f6f6 !important;
    }
    body.moba-fullscreen .xbot-share-copy {
      position: absolute !important;
      top: 6px !important;
      right: 6px !important;
      width: 28px !important;
      height: 28px !important;
      color: #8e8e8e !important;
      background: transparent !important;
    }
    body.moba-fullscreen .xbot-share-block pre,
    body.moba-fullscreen .xbot-share-block code {
      margin: 0 !important;
      white-space: pre-wrap !important;
      word-break: break-all !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
      font-size: 13px !important;
      line-height: 1.45 !important;
      color: #0d0d0d !important;
      background: transparent !important;
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
    body.moba-fullscreen .xbot-send[hidden] {
      display: none !important;
    }
    body.moba-fullscreen #xbot-audio.is-recording {
      background: #0d0d0d !important;
      color: #ffffff !important;
      animation: none !important;
      box-shadow: none !important;
    }
    body.moba-fullscreen .xbot-compose-inner.is-moba-recording {
      align-items: center !important;
    }
    body.moba-fullscreen .xbot-compose-inner.is-moba-recording > :not(.moba-rec):not(#xbot-audio) {
      display: none !important;
    }
    body.moba-fullscreen .moba-rec {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
      min-height: 40px;
      padding: 0 2px 0 0;
    }
    body.moba-fullscreen .moba-rec[hidden] {
      display: none !important;
    }
    body.moba-fullscreen .moba-rec__cancel {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #3a3a36;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    body.moba-fullscreen .moba-rec__cancel:hover {
      background: #fef2f2;
      color: #dc2626;
    }
    body.moba-fullscreen .moba-rec__dot {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: 999px;
      background: #ef4444;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45);
      animation: moba-rec-pulse 1.5s ease-out infinite;
    }
    body.moba-fullscreen .moba-rec__label {
      flex-shrink: 0;
      font-size: 14px;
      font-weight: 600;
      color: #0d0d0d;
    }
    body.moba-fullscreen .moba-rec__time {
      flex-shrink: 0;
      min-width: 2.8rem;
      font-variant-numeric: tabular-nums;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #dc2626;
    }
    body.moba-fullscreen .moba-rec__wave {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3px;
      flex: 1;
      min-width: 40px;
      height: 22px;
      overflow: hidden;
    }
    body.moba-fullscreen .moba-rec__wave span {
      display: block;
      flex: 0 0 3px;
      width: 3px;
      height: 18px;
      border-radius: 999px;
      background: #f87171;
      transform: scaleY(0.35);
      transform-origin: center;
      animation: moba-rec-bar 1s ease-in-out infinite;
    }
    body.moba-fullscreen .moba-rec__wave span:nth-child(2n) { animation-duration: 0.72s; }
    body.moba-fullscreen .moba-rec__wave span:nth-child(3n) { animation-duration: 1.15s; }
    body.moba-fullscreen .moba-rec__wave span:nth-child(5n) { animation-duration: 0.9s; }
    @keyframes moba-rec-pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
      70% { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    @keyframes moba-rec-bar {
      0%, 100% { transform: scaleY(0.28); opacity: 0.5; }
      50% { transform: scaleY(1); opacity: 1; }
    }
    @media (max-width: 420px) {
      body.moba-fullscreen .moba-rec__label { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      body.moba-fullscreen .moba-rec__dot,
      body.moba-fullscreen .moba-rec__wave span { animation: none; }
      body.moba-fullscreen .moba-rec__wave span {
        transform: scaleY(0.55);
        opacity: 0.8;
      }
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
      letter-spacing: 0.01em;
      cursor: default !important;
    }
    /* Wordmark xbot (Geom) — mesma tipografia do logo do site / header */
    body.moba-fullscreen .xbot-powered strong {
      font-family: 'Geom', sans-serif !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      letter-spacing: -0.04em !important;
      text-transform: lowercase !important;
      color: #1a1a18 !important;
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

const RECORDING_WAVE_BARS = 36
const MOBA_REC_SEND_ICON =
  '<svg class="moba-rec-send-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>'
const MOBA_REC_TRASH_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'

let mobaRecTimer = 0
let mobaRecStartedAt = 0
let mobaOwnsAudio = false
let mobaOwnedRecorder = null
let mobaOwnedChunks = []
let mobaOwnedStream = null
let mobaOwnedMime = null
let mobaOwnedDiscard = false
let mobaOwnedUploading = false
let mobaAudioObserver = null

function formatRecordingTime(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function mobaComposerLocale() {
  return (
    normalizeVisitorLocale(document.documentElement.lang) ||
    normalizeVisitorLocale(window.__mobaDisplayLang) ||
    'pt'
  )
}

function installMobaRecorderBridge() {
  if (typeof window.MediaRecorder !== 'function' || window.__mobaRecorderBridge) return
  const Native = window.MediaRecorder
  window.__mobaNativeMediaRecorder = Native
  function Bridged(stream, options) {
    const rec = options === undefined ? new Native(stream) : new Native(stream, options)
    window.__mobaLiveRecorder = { rec, stream }
    return rec
  }
  Bridged.prototype = Native.prototype
  if (typeof Native.isTypeSupported === 'function') {
    Bridged.isTypeSupported = (type) => Native.isTypeSupported(type)
  }
  window.MediaRecorder = Bridged
  window.__mobaRecorderBridge = true
}

function ensureRecordingBar(inner) {
  let bar = inner.querySelector('.moba-rec')
  if (bar) return bar
  bar = document.createElement('div')
  bar.className = 'moba-rec'
  bar.setAttribute('role', 'status')
  bar.hidden = true
  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'moba-rec__cancel'
  cancel.innerHTML = MOBA_REC_TRASH_ICON
  cancel.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    discardMobaRecording()
  })
  const dot = document.createElement('span')
  dot.className = 'moba-rec__dot'
  dot.setAttribute('aria-hidden', 'true')
  const label = document.createElement('span')
  label.className = 'moba-rec__label'
  const time = document.createElement('span')
  time.className = 'moba-rec__time'
  time.setAttribute('aria-hidden', 'true')
  time.textContent = '00:00'
  const wave = document.createElement('span')
  wave.className = 'moba-rec__wave'
  wave.setAttribute('aria-hidden', 'true')
  for (let index = 0; index < RECORDING_WAVE_BARS; index += 1) {
    const tick = document.createElement('span')
    tick.style.animationDelay = `${index * -0.08}s`
    wave.appendChild(tick)
  }
  bar.append(cancel, dot, label, time, wave)
  const audio = inner.querySelector('#xbot-audio')
  inner.insertBefore(bar, audio || null)
  return bar
}

function stopRecordingClock() {
  if (!mobaRecTimer) return
  clearInterval(mobaRecTimer)
  mobaRecTimer = 0
}

function startRecordingClock(time) {
  if (mobaRecTimer) return
  mobaRecStartedAt = Date.now()
  if (time) time.textContent = '00:00'
  mobaRecTimer = window.setInterval(() => {
    const node = document.querySelector('.moba-rec__time')
    if (!node) return
    const elapsed = Math.floor((Date.now() - mobaRecStartedAt) / 1000)
    node.textContent = formatRecordingTime(elapsed)
  }, 250)
}

function syncRecordingChrome() {
  const inner = document.querySelector('.xbot-compose-inner')
  const audio = document.getElementById('xbot-audio')
  if (!inner || !audio) return
  const recording = audio.classList.contains('is-recording')
  inner.classList.toggle('is-moba-recording', recording)
  const bar = recording ? ensureRecordingBar(inner) : inner.querySelector('.moba-rec')
  if (!recording) {
    stopRecordingClock()
    if (bar) bar.hidden = true
    return
  }
  const locale = mobaComposerLocale()
  bar.hidden = false
  const label = bar.querySelector('.moba-rec__label')
  const time = bar.querySelector('.moba-rec__time')
  const cancel = bar.querySelector('.moba-rec__cancel')
  if (label) label.textContent = tLocale(locale, 'recording')
  if (cancel) {
    const cancelText = tLocale(locale, 'recordingCancel')
    cancel.title = cancelText
    cancel.setAttribute('aria-label', cancelText)
  }
  const sendText = tLocale(locale, 'recordingSend')
  audio.setAttribute('aria-label', sendText)
  audio.title = sendText
  if (!audio.querySelector('.moba-rec-send-icon')) audio.innerHTML = MOBA_REC_SEND_ICON
  startRecordingClock(time)
}

function watchAudioButton(audio) {
  if (!audio) return
  if (mobaAudioObserver) mobaAudioObserver.disconnect()
  mobaAudioObserver = new MutationObserver(syncRecordingChrome)
  mobaAudioObserver.observe(audio, { attributes: true, attributeFilter: ['class'] })
  if (!audio.dataset.mobaMicHtml && !audio.classList.contains('is-recording')) {
    audio.dataset.mobaMicHtml = audio.innerHTML
  }
}

function pickOwnedMime() {
  const Native = window.__mobaNativeMediaRecorder || window.MediaRecorder
  const fallback = { mimeType: '', filename: 'audio.webm', blobType: 'audio/webm' }
  if (!Native || typeof Native.isTypeSupported !== 'function') return fallback
  const candidates = [
    { mimeType: 'audio/webm;codecs=opus', filename: 'audio.webm', blobType: 'audio/webm' },
    { mimeType: 'audio/webm', filename: 'audio.webm', blobType: 'audio/webm' },
    { mimeType: 'audio/mp4', filename: 'audio.m4a', blobType: 'audio/mp4' },
    { mimeType: 'audio/ogg;codecs=opus', filename: 'audio.ogg', blobType: 'audio/ogg' },
  ]
  return candidates.find((item) => Native.isTypeSupported(item.mimeType)) || fallback
}

const SKELETON_BARS = [
  ['bot', '78%'],
  ['bot', '52%'],
  ['user', '46%'],
  ['bot', '86%'],
  ['user', '34%'],
]

function messagesPinnedToLatest(el) {
  if (!el) return false
  const rows = el.querySelectorAll('.xbot-message-row')
  if (!rows.length) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight <= 28
}

function syncConversationSkeleton() {
  const messages = document.getElementById('xbot-messages')
  const box = messages?.closest('.xbot-chatbox')
  const skeleton = box?.querySelector(':scope > .moba-thread-skeleton')
  if (!messages || !box || !skeleton) return
  const boxRect = box.getBoundingClientRect()
  const msgRect = messages.getBoundingClientRect()
  skeleton.style.top = `${Math.max(0, msgRect.top - boxRect.top)}px`
  skeleton.style.height = `${Math.max(0, msgRect.height)}px`
}

function showConversationSkeleton() {
  document.body.classList.add('moba-thread-pending')
  const attach = () => {
    const messages = document.getElementById('xbot-messages')
    const box = messages?.closest('.xbot-chatbox')
    if (!messages || !box || !document.body.classList.contains('moba-thread-pending')) return false
    messages.setAttribute('aria-busy', 'true')
    let skeleton = box.querySelector(':scope > .moba-thread-skeleton')
    if (!skeleton) {
      skeleton = document.createElement('div')
      skeleton.className = 'moba-thread-skeleton'
      skeleton.setAttribute('aria-hidden', 'true')
      SKELETON_BARS.forEach(([side, width]) => {
        const row = document.createElement('span')
        row.className = `moba-thread-skeleton-row is-${side}`
        const bar = document.createElement('span')
        bar.className = 'moba-thread-skeleton-bar'
        bar.style.width = width
        row.appendChild(bar)
        skeleton.appendChild(row)
      })
      box.appendChild(skeleton)
    }
    syncConversationSkeleton()
    if (typeof ResizeObserver !== 'undefined') {
      if (!window.__mobaThreadSkeletonObserver) {
        window.__mobaThreadSkeletonObserver = new ResizeObserver(() => {
          if (document.body.classList.contains('moba-thread-pending')) syncConversationSkeleton()
        })
      }
      window.__mobaThreadSkeletonObserver.observe(messages)
      window.__mobaThreadSkeletonObserver.observe(box)
    }
    return true
  }
  if (!attach()) {
    let left = 40
    const timer = window.setInterval(() => {
      left -= 1
      if (attach() || left <= 0 || !document.body.classList.contains('moba-thread-pending')) {
        window.clearInterval(timer)
      }
    }, 50)
  }
  if (!window.__mobaThreadSkeletonResize) {
    window.__mobaThreadSkeletonResize = () => {
      if (document.body.classList.contains('moba-thread-pending')) syncConversationSkeleton()
    }
    window.addEventListener('resize', window.__mobaThreadSkeletonResize)
  }
}

function hideConversationSkeleton() {
  document.body.classList.remove('moba-thread-pending')
  const messages = document.getElementById('xbot-messages')
  if (messages) messages.removeAttribute('aria-busy')
  document.querySelector('.xbot-chatbox > .moba-thread-skeleton')?.remove()
}

function threadMediaPending(el) {
  if (!el) return false
  const images = el.querySelectorAll('.xbot-message-row img')
  for (const img of images) {
    if (!img.complete) return true
  }
  return false
}

/** Esconde o fio até o histórico existir e o scroll estar na última mensagem. */
function installConversationSkeleton() {
  showConversationSkeleton()
  window.setTimeout(() => {
    if (document.body.classList.contains('moba-thread-pending')) hideConversationSkeleton()
  }, 8000)
  if (window.__mobaThreadSkeletonGate) return
  window.__mobaThreadSkeletonGate = true
  const original = window.fetch.bind(window)
  window.__mobaThreadSkeletonPending = 0
  const revealWhenPinned = () => {
    const started = performance.now()
    let stable = 0
    const tick = () => {
      if (!document.body.classList.contains('moba-thread-pending')) return
      const el = document.getElementById('xbot-messages')
      syncConversationSkeleton()
      const ready = messagesPinnedToLatest(el) && !threadMediaPending(el)
      stable = ready ? stable + 1 : 0
      const waited = performance.now() - started
      if ((ready && stable >= 4 && waited >= 80) || waited > 1500) {
        hideConversationSkeleton()
        return
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
  window.fetch = async (input, init) => {
    const response = await original(input, init)
    const raw = typeof input === 'string' ? input : input instanceof Request ? input.url : input?.url || ''
    if (!String(raw).includes('/v1/xchat/history')) return response
    window.__mobaThreadSkeletonPending += 1
    let released = false
    const release = () => {
      if (released) return
      released = true
      window.__mobaThreadSkeletonPending = Math.max(0, (window.__mobaThreadSkeletonPending || 1) - 1)
      if (window.__mobaThreadSkeletonPending > 0) return
      revealWhenPinned()
    }
    if (!response.ok) {
      queueMicrotask(release)
      return response
    }
    const readJson = response.json.bind(response)
    response.json = async () => {
      try {
        return await readJson()
      } finally {
        queueMicrotask(() => requestAnimationFrame(release))
      }
    }
    return response
  }
  window.__mobaRevealThreadSkeleton = revealWhenPinned
}

function armConversationSkeletonIdle() {
  window.setTimeout(() => {
    if (!document.body.classList.contains('moba-thread-pending')) return
    if ((window.__mobaThreadSkeletonPending || 0) > 0) return
    if (typeof window.__mobaRevealThreadSkeleton === 'function') window.__mobaRevealThreadSkeleton()
    else hideConversationSkeleton()
  }, 1600)
}

function mobaVisitorId() {
  const cfg = window.__xbotConfig || {}
  const ext = cfg.user && cfg.user.externalUserId != null ? String(cfg.user.externalUserId).trim() : ''
  if (ext) {
    const safe = ext.replace(/[^\w.@+-]/g, '_').replace(/^ext_/i, '')
    if (safe) return `ext_${safe}`.slice(0, 50)
  }
  try {
    return localStorage.getItem('xbot_visitor_id') || ''
  } catch {
    return ''
  }
}

function appendOwnedAudioMessage(url) {
  const messages = document.getElementById('xbot-messages')
  if (!messages) return
  const empty = document.getElementById('xbot-empty')
  if (empty) empty.remove()
  const row = document.createElement('div')
  row.className = 'xbot-message-row user'
  const col = document.createElement('div')
  col.className = 'xbot-message-col'
  const msg = document.createElement('div')
  msg.className = 'xbot-message user'
  const content = document.createElement('div')
  content.className = 'xbot-message-content'
  const text = document.createElement('div')
  text.className = 'xbot-text'
  const audio = document.createElement('audio')
  audio.controls = true
  audio.preload = 'metadata'
  audio.src = url
  audio.style.width = '220px'
  audio.style.maxWidth = '100%'
  text.appendChild(audio)
  content.appendChild(text)
  msg.appendChild(content)
  const time = document.createElement('div')
  time.className = 'xbot-time'
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  col.append(msg, time)
  row.appendChild(col)
  messages.appendChild(row)
  messages.scrollTop = messages.scrollHeight
}

function showOwnedTyping() {
  const messages = document.getElementById('xbot-messages')
  if (!messages || messages.querySelector('[data-moba-typing="1"]')) return
  const el = document.createElement('div')
  el.className = 'xbot-typing'
  el.dataset.mobaTyping = '1'
  el.setAttribute('aria-live', 'polite')
  messages.appendChild(el)
  messages.scrollTop = messages.scrollHeight
}

function clearOwnedTypingSoon() {
  const messages = document.getElementById('xbot-messages')
  if (!messages) return
  const remove = () => {
    messages.querySelectorAll('[data-moba-typing="1"]').forEach((node) => node.remove())
  }
  const observer = new MutationObserver(() => {
    if (messages.querySelector('.xbot-message-row.bot')) {
      remove()
      observer.disconnect()
    }
  })
  observer.observe(messages, { childList: true })
  window.setTimeout(() => {
    remove()
    observer.disconnect()
  }, 90000)
}

async function uploadOwnedRecording(blob, filename) {
  const audio = document.getElementById('xbot-audio')
  const cfg = window.__xbotConfig || {}
  const api = String(cfg.apiBaseUrl || '').replace(/\/$/, '')
  const url = api ? `${api}/v1/xchat/upload` : '/api/xbot/upload'
  appendOwnedAudioMessage(URL.createObjectURL(blob))
  showOwnedTyping()
  clearOwnedTypingSoon()
  const formData = new FormData()
  formData.append('file', blob, filename || 'audio.webm')
  if (cfg.channelId) formData.append('channel_id', cfg.channelId)
  const visitorId = mobaVisitorId()
  if (visitorId) formData.append('visitor_id', visitorId)
  if (cfg.user && typeof cfg.user === 'object') {
    try { formData.append('user', JSON.stringify(cfg.user)) } catch { /* ignore */ }
  }
  const context = { ...(cfg.context && typeof cfg.context === 'object' ? cfg.context : {}) }
  if (!context.pageUrl && window.location) context.pageUrl = window.location.href
  try { formData.append('context', JSON.stringify(context)) } catch { /* ignore */ }
  const headers = {}
  if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`
  try {
    const res = await fetch(url, { method: 'POST', headers, body: formData })
    if (!res.ok) throw new Error('upload failed')
    const data = await res.json()
    if (data.visitor_id) {
      try { localStorage.setItem('xbot_visitor_id', data.visitor_id) } catch { /* ignore */ }
    }
    if (!data.bot_reply_enabled) {
      document.querySelectorAll('[data-moba-typing="1"]').forEach((node) => node.remove())
    }
  } catch {
    document.querySelectorAll('[data-moba-typing="1"]').forEach((node) => node.remove())
    const messages = document.getElementById('xbot-messages')
    if (messages) {
      const row = document.createElement('div')
      row.className = 'xbot-message-row bot xbot-message-row--no-avatar'
      row.innerHTML = '<div class="xbot-message-col"><div class="xbot-message bot"><div class="xbot-message-content"><div class="xbot-text"><p>Erro ao enviar o áudio.</p></div></div></div></div>'
      messages.appendChild(row)
      messages.scrollTop = messages.scrollHeight
    }
  } finally {
    mobaOwnedUploading = false
    mobaOwnedRecorder = null
    if (audio) {
      audio.classList.remove('is-recording', 'is-uploading')
      audio.disabled = false
      if (audio.dataset.mobaMicHtml) audio.innerHTML = audio.dataset.mobaMicHtml
      audio.setAttribute('aria-label', 'Gravar áudio')
    }
    syncRecordingChrome()
    syncMobaPrimaryAction()
  }
}

function finishOwnedStream() {
  if (!mobaOwnedStream) return
  try { mobaOwnedStream.getTracks().forEach((track) => track.stop()) } catch { /* ignore */ }
  mobaOwnedStream = null
}

async function startOwnedRecording() {
  const audio = document.getElementById('xbot-audio')
  const Native = window.__mobaNativeMediaRecorder || window.MediaRecorder
  if (!audio || !Native || !navigator.mediaDevices?.getUserMedia || mobaOwnedUploading) return
  try {
    mobaOwnedStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mobaOwnedMime = pickOwnedMime()
    const rec = mobaOwnedMime.mimeType
      ? new Native(mobaOwnedStream, { mimeType: mobaOwnedMime.mimeType })
      : new Native(mobaOwnedStream)
    mobaOwnedChunks = []
    mobaOwnedDiscard = false
    rec.ondataavailable = (event) => {
      if (event.data && event.data.size) mobaOwnedChunks.push(event.data)
    }
    rec.onstop = () => {
      const discard = mobaOwnedDiscard
      mobaOwnedDiscard = false
      finishOwnedStream()
      if (discard) {
        mobaOwnedRecorder = null
        audio.classList.remove('is-recording', 'is-uploading')
        if (audio.dataset.mobaMicHtml) audio.innerHTML = audio.dataset.mobaMicHtml
        syncRecordingChrome()
        syncMobaPrimaryAction()
        return
      }
      mobaOwnedUploading = true
      audio.classList.remove('is-recording')
      audio.classList.add('is-uploading')
      syncRecordingChrome()
      const blob = new Blob(mobaOwnedChunks, { type: (mobaOwnedMime.blobType || 'audio/webm').split(';')[0] })
      uploadOwnedRecording(blob, mobaOwnedMime.filename || 'audio.webm')
    }
    rec.start(250)
    mobaOwnedRecorder = rec
    audio.classList.add('is-recording')
    audio.classList.remove('is-uploading')
    syncRecordingChrome()
  } catch {
    finishOwnedStream()
    audio.classList.remove('is-recording', 'is-uploading')
    window.alert('Erro ao iniciar gravação de áudio.')
  }
}

function cancelOwnedRecording() {
  if (!mobaOwnedRecorder || mobaOwnedRecorder.state === 'inactive') {
    finishOwnedStream()
    const audio = document.getElementById('xbot-audio')
    if (audio) audio.classList.remove('is-recording', 'is-uploading')
    syncRecordingChrome()
    return
  }
  mobaOwnedDiscard = true
  try { mobaOwnedRecorder.stop() } catch { /* ignore */ }
}

function onOwnedAudioClick(event) {
  event.preventDefault()
  event.stopPropagation()
  if (mobaOwnedUploading) return
  if (mobaOwnedRecorder && mobaOwnedRecorder.state === 'recording') {
    try { mobaOwnedRecorder.stop() } catch { /* ignore */ }
    return
  }
  startOwnedRecording()
}

function takeOverAudioButton() {
  const audio = document.getElementById('xbot-audio')
  if (!audio || mobaOwnsAudio) return
  const next = audio.cloneNode(true)
  next.classList.remove('is-recording', 'is-uploading')
  next.disabled = false
  next.hidden = false
  if (audio.dataset.mobaMicHtml) next.innerHTML = audio.dataset.mobaMicHtml
  audio.replaceWith(next)
  next.addEventListener('click', onOwnedAudioClick)
  mobaOwnsAudio = true
  watchAudioButton(next)
  syncMobaPrimaryAction()
}

function discardLegacyAndTakeOver() {
  const live = window.__mobaLiveRecorder
  if (live?.rec) {
    const { rec, stream } = live
    window.__mobaLiveRecorder = null
    rec.onstop = () => {
      try { stream.getTracks().forEach((track) => track.stop()) } catch { /* ignore */ }
    }
    try {
      if (rec.state !== 'inactive') rec.stop()
      else stream.getTracks().forEach((track) => track.stop())
    } catch { /* ignore */ }
  }
  takeOverAudioButton()
  syncRecordingChrome()
}

function discardMobaRecording() {
  if (mobaOwnsAudio) {
    cancelOwnedRecording()
    return
  }
  if (typeof window.__xbotDiscardRecording === 'function') {
    window.__xbotDiscardRecording()
    return
  }
  const audio = document.getElementById('xbot-audio')
  if (audio) {
    const event = new CustomEvent('xbot:discard-recording', { cancelable: true, bubbles: true })
    audio.dispatchEvent(event)
    if (event.defaultPrevented) return
  }
  discardLegacyAndTakeOver()
}

function bindMobaRecordingChrome() {
  const audio = document.getElementById('xbot-audio')
  if (!audio || audio.dataset.mobaRecBound === '1') return false
  audio.dataset.mobaRecBound = '1'
  installMobaRecorderBridge()
  watchAudioButton(audio)
  if (!window.__mobaRecKeyBound) {
    window.__mobaRecKeyBound = true
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      const current = document.getElementById('xbot-audio')
      if (!current || !current.classList.contains('is-recording')) return
      event.preventDefault()
      discardMobaRecording()
    })
  }
  syncRecordingChrome()
  return true
}

function syncMobaPrimaryAction() {
  const input = document.getElementById('xbot-input')
  const audio = document.getElementById('xbot-audio')
  const send = document.getElementById('xbot-send')
  if (!input || !audio || !send) return
  const holdAudio = audio.classList.contains('is-recording') || audio.classList.contains('is-uploading')
  const hasChars = String(input.value || '').length > 0
  const showAudio = holdAudio || !hasChars
  audio.hidden = !showAudio
  send.hidden = !hasChars || holdAudio
}

/** Microfone no lugar do envio enquanto o campo está vazio. Idempotente com o widget novo. */
function bindMobaComposerPrimaryAction() {
  const input = document.getElementById('xbot-input')
  const audio = document.getElementById('xbot-audio')
  const send = document.getElementById('xbot-send')
  const inner = document.querySelector('.xbot-compose-inner')
  if (!input || !audio || !send || !inner) return false
  audio.classList.add('xbot-send')
  audio.classList.remove('xbot-icon-btn')
  if (send.previousElementSibling !== audio) inner.insertBefore(audio, send)
  if (inner.lastElementChild !== send) inner.appendChild(send)
  if (input.dataset.mobaPrimaryBound !== '1') {
    input.dataset.mobaPrimaryBound = '1'
    input.addEventListener('input', syncMobaPrimaryAction)
    const observer = new MutationObserver(syncMobaPrimaryAction)
    observer.observe(inner, { subtree: true, attributes: true, attributeFilter: ['class'] })
  }
  bindMobaRecordingChrome()
  syncMobaPrimaryAction()
  return true
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

const MOBA_HEADER_ROLE = 'Xbot Specialist'

/** Display name (já no header). No acesso por telefone o papel some: quem fala é o Aprendiz. */
function renderHeaderIdentity(role = MOBA_HEADER_ROLE) {
  const text = document.querySelector('.xbot-chatbox .xbot-header .xbot-header-text')
  if (!text) return false
  let roleEl = text.querySelector('.xbot-header-role')
  if (!role) {
    roleEl?.remove()
    return true
  }
  if (!roleEl) {
    roleEl = document.createElement('span')
    roleEl.className = 'xbot-header-role'
    text.appendChild(roleEl)
  }
  if (roleEl.textContent !== role) roleEl.textContent = role
  return true
}

function renderLocaleSwitch(locale, { enabled = true } = {}) {
  const header = document.querySelector('.xbot-chatbox .xbot-header')
  if (!header) return false
  if (!enabled) {
    header.querySelector('.moba-locale--header')?.remove()
    return true
  }
  const code = normalizeVisitorLocale(locale) || 'pt'
  let wrap = header.querySelector('.moba-locale--header')
  if (!wrap) {
    wrap = document.createElement('label')
    wrap.className = 'moba-locale moba-locale--header'
    const select = document.createElement('select')
    select.setAttribute('aria-label', tLocale(code, 'langLabel'))
    VISITOR_LOCALES.forEach((item) => {
      const option = document.createElement('option')
      option.value = item.id
      option.textContent = item.label
      select.appendChild(option)
    })
    select.addEventListener('change', () => {
      const next = normalizeVisitorLocale(select.value)
      if (!next || next === code) return
      writeExplicitLocale(next)
      window.location.reload()
    })
    wrap.appendChild(select)
    const brand = header.querySelector('.xbot-moba-brand-logo')
    if (brand) header.insertBefore(wrap, brand)
    else header.appendChild(wrap)
  }
  const select = wrap.querySelector('select')
  if (select && select.value !== code) select.value = code
  return true
}

/** Wordmark Xbot (mesmo do site) no canto superior direito do header — só marca, sem link. */
function renderBrandLogo({ enabled = true } = {}) {
  const header = document.querySelector('.xbot-chatbox .xbot-header')
  if (!header) return false
  if (!enabled) {
    header.querySelector('.xbot-moba-brand-logo')?.remove()
    return true
  }
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

function operatorLabel(profile) {
  const name = (profile?.name || '').trim()
  if (name) return name
  const email = (profile?.email || '').trim()
  if (!email) return ''
  return email.split('@')[0] || email
}

function avatarInitial(label) {
  const match = String(label || '').match(/[A-Za-z0-9]/)
  return (match ? match[0] : String(label || '?').slice(0, 1)).toUpperCase()
}

const SHARE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>'

function readInviteUrl(identity) {
  try {
    const url = new URL(String(identity?.invite_url || '').trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length === 2 && parts[0] === 'invite' && /^[A-Za-z0-9]{4,12}$/.test(parts[1])) {
      return url.toString()
    }
  } catch {
    /* endereço ausente ou inválido */
  }
  return ''
}

function bindInviteDismiss() {
  if (window.__mobaInviteDismiss) return
  window.__mobaInviteDismiss = true
  const close = () => {
    document.querySelectorAll('.moba-invite-popover').forEach((node) => node.setAttribute('hidden', ''))
    document.querySelectorAll('.moba-invite-share').forEach((node) => node.setAttribute('aria-expanded', 'false'))
  }
  document.addEventListener('click', close)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
  })
}

/** Ícone à esquerda do avatar. O popover copia o link /invite/{código}. */
function renderInviteShare(chip, inviteUrl, locale) {
  const url = readInviteUrl({ invite_url: inviteUrl })
  const anchor = chip.closest('.xbot-header') || chip
  const avatar = chip.querySelector('.moba-operator-avatar')
  let button = chip.querySelector('.moba-invite-share')
  let popover = anchor.querySelector('.moba-invite-popover')
  if (!url) {
    button?.remove()
    popover?.remove()
    return
  }
  if (!button) {
    button = document.createElement('button')
    button.type = 'button'
    button.className = 'moba-invite-share'
    button.innerHTML = SHARE_ICON
    button.setAttribute('aria-haspopup', 'dialog')
    button.setAttribute('aria-expanded', 'false')
    if (avatar) avatar.before(button)
    else chip.prepend(button)
    popover = document.createElement('div')
    popover.className = 'moba-invite-popover'
    popover.setAttribute('hidden', '')
    popover.setAttribute('role', 'dialog')
    const title = document.createElement('p')
    title.className = 'moba-invite-title'
    const field = document.createElement('input')
    field.className = 'moba-invite-url'
    field.readOnly = true
    field.spellcheck = false
    const copy = document.createElement('button')
    copy.type = 'button'
    copy.className = 'moba-invite-copy'
    popover.append(title, field, copy)
    anchor.appendChild(popover)
    bindInviteDismiss()
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      const opening = popover.hasAttribute('hidden')
      document.querySelectorAll('.moba-invite-popover').forEach((node) => node.setAttribute('hidden', ''))
      document.querySelectorAll('.moba-invite-share').forEach((node) => node.setAttribute('aria-expanded', 'false'))
      if (!opening) return
      popover.removeAttribute('hidden')
      button.setAttribute('aria-expanded', 'true')
      field.focus()
      field.select()
    })
    popover.addEventListener('click', (event) => event.stopPropagation())
    copy.addEventListener('click', () => {
      const value = button.dataset.url || ''
      const mark = () => {
        copy.textContent = tLocale(locale, 'inviteCopied')
        window.setTimeout(() => {
          copy.textContent = copy.dataset.label || tLocale(locale, 'inviteCopy')
        }, 1600)
      }
      const area = document.createElement('textarea')
      area.value = value
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '0'
      area.style.left = '0'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.focus()
      area.select()
      let legacy = false
      try { legacy = document.execCommand('copy') } catch { legacy = false }
      area.remove()
      field.focus()
      field.select()
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(value).then(mark).catch(() => { if (legacy) mark() })
        return
      }
      if (legacy) mark()
    })
  } else if (avatar && button.nextElementSibling !== avatar) {
    avatar.before(button)
  }
  const label = tLocale(locale, 'shareInvite')
  button.dataset.url = url
  button.setAttribute('aria-label', label)
  if (!popover) return
  popover.setAttribute('aria-label', label)
  const title = popover.querySelector('.moba-invite-title')
  const field = popover.querySelector('.moba-invite-url')
  const copy = popover.querySelector('.moba-invite-copy')
  if (title) title.textContent = label
  if (field && field.value !== url) field.value = url
  if (popover.id) button.setAttribute('aria-controls', popover.id)
  else {
    popover.id = 'moba-invite-popover'
    button.setAttribute('aria-controls', popover.id)
  }
  if (copy) {
    copy.dataset.label = tLocale(locale, 'inviteCopy')
    if (copy.textContent !== tLocale(locale, 'inviteCopied')) copy.textContent = copy.dataset.label
  }
}

function readSetupToken(identity) {
  const token = String(identity?.setup_token || '').trim()
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(token)) return ''
  return token
}

function onOperatorNameClick(event) {
  event.preventDefault()
  event.stopPropagation()
  const button = event.currentTarget
  const token = button.dataset.setupToken || ''
  if (!token) return
  const open = button.getAttribute('aria-expanded') === 'true'
  document.querySelectorAll('.moba-invite-popover').forEach((node) => node.setAttribute('hidden', ''))
  document.querySelectorAll('.moba-invite-share').forEach((node) => node.setAttribute('aria-expanded', 'false'))
  const anchor = button.closest('.xbot-header') || button
  const rect = anchor.getBoundingClientRect()
  window.dispatchEvent(new CustomEvent('moba-setup-toggle', {
    detail: {
      token: open ? '' : token,
      top: rect.bottom + 10,
      right: Math.max(12, window.innerWidth - rect.right),
      width: Math.min(420, Math.max(280, rect.width)),
    },
  }))
  button.setAttribute('aria-expanded', open ? 'false' : 'true')
}

function renderOperatorName(chip, label, setupToken, locale) {
  const clickable = Boolean(setupToken)
  let name = chip.querySelector('.moba-operator-name')
  if (name && clickable !== (name.tagName === 'BUTTON')) {
    name.remove()
    name = null
  }
  if (!name) {
    name = document.createElement(clickable ? 'button' : 'span')
    name.className = 'moba-operator-name'
    if (clickable) {
      name.type = 'button'
      name.setAttribute('aria-haspopup', 'dialog')
      name.setAttribute('aria-expanded', 'false')
      name.addEventListener('click', onOperatorNameClick)
    }
    chip.appendChild(name)
  }
  if (name.textContent !== label) name.textContent = label
  if (!clickable) return name
  name.dataset.setupToken = setupToken
  name.title = tLocale(locale, 'accountSetup')
  return name
}

/** Pessoa identificada no canto direito do header: conta de operador ou visitante do SMS. */
function renderOperatorAccount(visitorIdentity, locale = 'pt') {
  const header = document.querySelector('.xbot-chatbox .xbot-header')
  if (!header) return false
  const profile = readOperatorProfile()
  const label = operatorLabel(profile) || visitorDisplayLabel(visitorIdentity)
  if (!label) return true
  const title = (profile.email || visitorIdentity?.email || formatTitlePhone(visitorIdentity)).trim()
  let chip = header.querySelector('.moba-operator')
  if (!chip) {
    chip = document.createElement('span')
    chip.className = 'moba-operator'
    const avatar = document.createElement('span')
    avatar.className = 'moba-operator-avatar'
    chip.appendChild(avatar)
    header.appendChild(chip)
  }
  if (title) chip.title = title
  const avatar = chip.querySelector('.moba-operator-avatar')
  if (avatar) avatar.textContent = avatarInitial(label)
  const name = renderOperatorName(chip, label, readSetupToken(visitorIdentity), locale)
  renderInviteShare(chip, visitorIdentity?.invite_url, locale)
  return true
}

function formatTitlePhone(identity) {
  const digits = String(identity?.phone || '').replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

function renderHeaderName(name) {
  const el = document.querySelector('.xbot-chatbox .xbot-header .xbot-header-name')
  const label = String(name || '').trim()
  if (!el || !label) return Boolean(el)
  if (el.textContent !== label) el.textContent = label
  return true
}

function ensureHeaderChrome({
  attempts = 12,
  intervalMs = 250,
  locale = 'pt',
  showBrand = true,
  showLocale = true,
  visitorIdentity = null,
  headerRole = MOBA_HEADER_ROLE,
  headerName = '',
} = {}) {
  const paint = () =>
    renderBrandLogo({ enabled: showBrand }) &&
    renderHeaderName(headerName) &&
    renderHeaderIdentity(headerRole) &&
    renderLocaleSwitch(locale, { enabled: showLocale }) &&
    renderOperatorAccount(visitorIdentity, locale)
  if (paint()) return
  let left = attempts
  const timer = setInterval(() => {
    left -= 1
    if (paint() || left <= 0) clearInterval(timer)
  }, intervalMs)
}

/**
 * Monta o XChat em modo fullscreen (única UI do MOBA).
 */
export async function mountXChatFromBootstrap(bootstrap, { locale = 'pt', personal: personalRequested = false } = {}) {
  const xchat = bootstrap?.xchat || {}
  const auth = bootstrap?.auth || {}
  const channelId = xchat.channel_id || bootstrap.channel_id || bootstrap.object_id
  const token = auth.token
  const apiBaseUrl = (xchat.api_base_url || '').replace(/\/$/, '')
  const scriptUrl = xchat.script_cdn_url || getXchatScriptUrl()

  if (!channelId || !token) {
    throw new Error('Bootstrap incompleto (channel/token)')
  }

  let visitorIdentity = readVisitorIdentity()
  const pathCode = String(window.location.pathname || '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')[0]
  const openedByCode = Boolean(pathCode)
  const personal = personalRequested === true || (bootstrap.phone_identity_required && !openedByCode)
  if (personal) installVisitorIdentityExpiry()
  if (personal && visitorIdentity?.channel_id !== String(channelId)) {
    try {
      localStorage.removeItem('moba_verified_visitor')
      sessionStorage.removeItem('moba_verified_visitor')
    } catch { /* storage indisponível */ }
    window.location.replace('/')
    return
  }
  if (personal && visitorIdentity?.visitor_id) {
    try {
      const session = await fetchPhoneSession({
        visitorId: visitorIdentity.visitor_id,
      })
      if (session?.ok) {
        visitorIdentity = rememberVisitorProfile({
          name: session.name,
          email: session.email,
          phone: session.phone,
          invite_url: session.invite_url || '',
          setup_token: session.setup_token || '',
        }) || visitorIdentity
      }
    } catch {
      /* A credencial local ainda identifica a pessoa enquanto a consulta não responde. */
    }
  }
  const widget = xchat.widget || {}
  const assistant = bootstrap.assistant && typeof bootstrap.assistant === 'object' ? bootstrap.assistant : {}
  const assistantName = String(assistant.name || assistant.display_name || '').trim()
  const assistantRole = String(assistant.role || '').trim()
  // Fundo + preload antes do script: o visitante vê a marca enquanto o XChat baixa.
  applyMobaBackground(widget)
  writeCachedMobaAppearance(bootstrap.public_code || bootstrap.object_id, widget)

  const activeLocale = normalizeVisitorLocale(locale) || 'pt'
  installDisplayLangFetch(activeLocale)
  if (!personal) installOperatorSessionFetch()
  document.documentElement.lang = activeLocale === 'pt' ? 'pt-BR' : activeLocale === 'zh' ? 'zh-CN' : activeLocale

  injectFullscreenCss()
  document.documentElement.classList.add('moba-fullscreen')
  document.body.classList.add('moba-xchat-live', 'moba-fullscreen')

  await loadScript(scriptUrl)
  await waitFor(() => typeof window.initXBot === 'function')

  const freshSession = !bootstrap.phone_identity_required && shouldStartFreshSession()
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
    botName: personal
      ? (assistantName || widget.bot_name || bootstrap.display_name || 'MOBA')
      : (widget.bot_name || bootstrap.display_name || 'Xbot'),
    botAvatar: widget.bot_avatar_url || '',
    userAvatar: widget.user_avatar_url || '',
    themeColor: widget.theme_color || '#0073ea',
    choiceStyle:
      widget.choice_style === 'glass_light' || widget.choice_style === 'glass_dark'
        ? widget.choice_style
        : 'classic',
    welcomeMessage: personal ? undefined : (widget.welcome_message || undefined),
    // Notificação nativa do browser + som do app ao receber mensagem do bot.
    browserNotify: true,
    locale: activeLocale,
  }
  if (personal) {
    initConfig.user = { externalUserId: visitorIdentity.visitor_id }
    if (visitorIdentity.name) initConfig.user.name = visitorIdentity.name
    if (visitorIdentity.email) initConfig.user.email = visitorIdentity.email
    if (visitorIdentity.phone) initConfig.user.phone = visitorIdentity.phone
  } else if (freshSession) {
    initConfig.user = {
      externalUserId: `moba_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    }
  }
  installConversationSkeleton()
  window.initXBot(initConfig)

  if (typeof window.setXBotContext === 'function') {
    window.setXBotContext(context)
  }

  await waitFor(() => typeof window.openXBot === 'function')
  window.openXBot()
  showConversationSkeleton()
  armConversationSkeletonIdle()
  const headerChrome = {
    locale: activeLocale,
    showBrand: !personal,
    showLocale: personal ? assistant.show_language === true : true,
    visitorIdentity,
    headerName: personal ? initConfig.botName : '',
    headerRole: personal ? (assistantRole || tLocale(activeLocale, 'assistantRole')) : MOBA_HEADER_ROLE,
  }
  ensureHeaderChrome(headerChrome)
  bindMobaComposerPrimaryAction()
  const heroPrompt = readMobaPromptQuery()
  const placeholder = tLocale(activeLocale, 'placeholder')
  ;[400, 1500, 4000].forEach((ms) => {
    setTimeout(() => {
      if (typeof window.openXBot === 'function') window.openXBot()
      const box = document.querySelector('.xbot-chatbox')
      if (box) {
        box.classList.add('is-open', 'is-visible')
      }
      const input = document.getElementById('xbot-input')
      if (input) {
        input.placeholder = placeholder
        input.dataset.mobaPh = '1'
      }
      if (heroPrompt) applyMobaPromptToComposer(heroPrompt)
      bindMobaComposerPrimaryAction()
      ensureHeaderChrome(headerChrome)
    }, ms)
  })
}
