/** Idiomas do visitante MOBA. A escolha explícita fica em localStorage. */

export const VISITOR_LOCALES = [
  { id: 'pt', label: 'Português' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'zh', label: '中文' },
]

const STORAGE_KEY = 'moba.locale'

const ZH_TIMEZONES = new Set([
  'Asia/Shanghai',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Urumqi',
  'Asia/Hong_Kong',
  'Asia/Macau',
  'Asia/Taipei',
])

const COPY = {
  pt: {
    langLabel: 'Idioma',
    placeholder: 'Pergunte qualquer coisa',
    pinKicker: 'privado',
    pinCopy: 'Informe o PIN de 4 caracteres para abrir a conversa.',
    pinInvalid: 'PIN inválido. Tente de novo.',
    pinFailed: 'Não foi possível validar o PIN.',
    pinChecking: 'Verificando…',
    pinEnter: 'Entrar',
    notFoundTitle: 'Página não encontrada',
    notFoundDetail: 'Este endereço não existe ou o link está incompleto.',
    invalidTitle: 'Link inválido',
    invalidDetail: 'O endereço desta conversa não está no formato esperado.',
    networkTitle: 'Não foi possível abrir',
    networkDetail: 'A conversa não carregou agora. Tente de novo em instantes ou conheça a plataforma.',
    missingTitle: 'Canal indisponível',
    missingDetail: 'Esta conversa não está disponível ou o endereço não existe.',
    genericTitle: 'Não foi possível abrir',
    genericDetail: 'Esta conversa não está disponível neste momento.',
    cta: 'Conhecer o xbot',
    bootError: 'Não foi possível abrir o MOBA',
    phoneTitle: 'Qual é o seu número?',
    phoneSubtitle: 'Enviamos um código por SMS agora. A verificação precisa ser concluída para continuar.',
    phoneLabel: 'Número de telefone',
    countryCode: 'Código do país',
    phonePlaceholder: '54 99999-9999',
    phoneSend: 'Enviar código',
    phoneSending: 'Enviando…',
    phoneInvalid: 'Informe o número completo, com DDI e DDD.',
    phoneLimited: 'Muitas tentativas neste número. Espere um pouco e tente de novo.',
    phoneSendFailed: 'Não foi possível enviar o SMS. Tente de novo.',
    codeTitle: 'Digite o código',
    codeSubtitle: 'Enviamos um código de 6 dígitos para +{phone}.',
    codeDigit: 'Dígito {n}',
    codeConfirm: 'Confirmar',
    codeChecking: 'Conferindo…',
    codeInvalid: 'Código inválido. Digite os 6 números de novo.',
    codeExpired: 'Esse código expirou. Peça outro.',
    changeNumber: 'Trocar número',
    resendCode: 'Reenviar código',
    phoneUnknown: 'Esse número ainda não está numa conta.',
  },
  en: {
    langLabel: 'Language',
    placeholder: 'Ask anything',
    pinKicker: 'private',
    pinCopy: 'Enter the 4-character PIN to open the conversation.',
    pinInvalid: 'Invalid PIN. Try again.',
    pinFailed: 'Could not verify the PIN.',
    pinChecking: 'Checking…',
    pinEnter: 'Enter',
    notFoundTitle: 'Page not found',
    notFoundDetail: 'This address does not exist or the link is incomplete.',
    invalidTitle: 'Invalid link',
    invalidDetail: 'This conversation address is not in the expected format.',
    networkTitle: 'Could not open',
    networkDetail: 'The conversation did not load. Try again in a moment or visit the platform.',
    missingTitle: 'Channel unavailable',
    missingDetail: 'This conversation is not available or the address does not exist.',
    genericTitle: 'Could not open',
    genericDetail: 'This conversation is not available right now.',
    cta: 'Discover xbot',
    bootError: 'Could not open MOBA',
    phoneTitle: "What's your phone number?",
    phoneSubtitle: "We'll text you a code right away. Verification has to be finished before you continue.",
    phoneLabel: 'Phone number',
    countryCode: 'Country code',
    phonePlaceholder: '415 555 0134',
    phoneSend: 'Send code',
    phoneSending: 'Sending…',
    phoneInvalid: 'Enter the full number, including the country code.',
    phoneLimited: 'Too many attempts for this number. Wait a moment and try again.',
    phoneSendFailed: "We couldn't send the text. Try again.",
    codeTitle: 'Enter the code',
    codeSubtitle: 'We sent a 6-digit code to +{phone}.',
    codeDigit: 'Digit {n}',
    codeConfirm: 'Confirm',
    codeChecking: 'Checking…',
    codeInvalid: "That code doesn't match. Enter all 6 digits again.",
    codeExpired: 'That code expired. Ask for another one.',
    changeNumber: 'Change number',
    resendCode: 'Resend code',
    phoneUnknown: 'This number is not on an account yet.',
  },
  es: {
    langLabel: 'Idioma',
    placeholder: 'Pregunta lo que quieras',
    pinKicker: 'privado',
    pinCopy: 'Introduce el PIN de 4 caracteres para abrir la conversación.',
    pinInvalid: 'PIN no válido. Inténtalo de nuevo.',
    pinFailed: 'No se pudo validar el PIN.',
    pinChecking: 'Comprobando…',
    pinEnter: 'Entrar',
    notFoundTitle: 'Página no encontrada',
    notFoundDetail: 'Esta dirección no existe o el enlace está incompleto.',
    invalidTitle: 'Enlace no válido',
    invalidDetail: 'La dirección de esta conversación no tiene el formato esperado.',
    networkTitle: 'No se pudo abrir',
    networkDetail: 'La conversación no cargó. Inténtalo de nuevo en un momento o conoce la plataforma.',
    missingTitle: 'Canal no disponible',
    missingDetail: 'Esta conversación no está disponible o la dirección no existe.',
    genericTitle: 'No se pudo abrir',
    genericDetail: 'Esta conversación no está disponible en este momento.',
    cta: 'Conocer xbot',
    bootError: 'No se pudo abrir MOBA',
    phoneTitle: '¿Cuál es tu número?',
    phoneSubtitle: 'Te enviamos un código por SMS ahora. La verificación tiene que completarse para seguir.',
    phoneLabel: 'Número de teléfono',
    countryCode: 'Código de país',
    phonePlaceholder: '11 5555 0134',
    phoneSend: 'Enviar código',
    phoneSending: 'Enviando…',
    phoneInvalid: 'Escribe el número completo, con el código de país.',
    phoneLimited: 'Demasiados intentos para este número. Espera un momento e inténtalo de nuevo.',
    phoneSendFailed: 'No pudimos enviar el SMS. Inténtalo de nuevo.',
    codeTitle: 'Escribe el código',
    codeSubtitle: 'Enviamos un código de 6 dígitos a +{phone}.',
    codeDigit: 'Dígito {n}',
    codeConfirm: 'Confirmar',
    codeChecking: 'Comprobando…',
    codeInvalid: 'El código no coincide. Escribe los 6 números otra vez.',
    codeExpired: 'Ese código expiró. Pide otro.',
    changeNumber: 'Cambiar número',
    resendCode: 'Reenviar código',
    phoneUnknown: 'Este número todavía no está en una cuenta.',
  },
  zh: {
    langLabel: '语言',
    placeholder: '随便问',
    pinKicker: '私密',
    pinCopy: '输入 4 位 PIN 以打开对话。',
    pinInvalid: 'PIN 无效，请重试。',
    pinFailed: '无法验证 PIN。',
    pinChecking: '正在验证…',
    pinEnter: '进入',
    notFoundTitle: '找不到页面',
    notFoundDetail: '这个地址不存在，或链接不完整。',
    invalidTitle: '链接无效',
    invalidDetail: '此对话地址的格式不正确。',
    networkTitle: '无法打开',
    networkDetail: '对话暂时没有加载。请稍后再试，或了解平台。',
    missingTitle: '频道不可用',
    missingDetail: '此对话不可用，或地址不存在。',
    genericTitle: '无法打开',
    genericDetail: '此对话目前不可用。',
    cta: '了解 xbot',
    bootError: '无法打开 MOBA',
    phoneTitle: '你的手机号是多少？',
    phoneSubtitle: '我们会马上发一条验证码短信。验证完成之后才能继续。',
    phoneLabel: '手机号',
    countryCode: '国家代码',
    phonePlaceholder: '138 0000 0000',
    phoneSend: '发送验证码',
    phoneSending: '发送中…',
    phoneInvalid: '请填写完整号码，包括国家代码。',
    phoneLimited: '这个号码尝试次数太多。请稍后再试。',
    phoneSendFailed: '短信没有发出去。请再试一次。',
    codeTitle: '输入验证码',
    codeSubtitle: '我们向 +{phone} 发送了 6 位验证码。',
    codeDigit: '第 {n} 位',
    codeConfirm: '确认',
    codeChecking: '正在核对…',
    codeInvalid: '验证码不正确。请重新输入 6 位数字。',
    codeExpired: '这个验证码已过期。请重新获取。',
    changeNumber: '更换号码',
    resendCode: '重新发送',
    phoneUnknown: '这个号码还没有对应的账号。',
  },
}

export function normalizeVisitorLocale(raw) {
  const code = String(raw || '')
    .trim()
    .toLowerCase()
    .replace('_', '-')
    .split('-')[0]
  return VISITOR_LOCALES.some((item) => item.id === code) ? code : null
}

export function readExplicitLocale() {
  try {
    return normalizeVisitorLocale(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeExplicitLocale(locale) {
  const code = normalizeVisitorLocale(locale)
  if (!code) return
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* ignore */
  }
}

export function suggestClientLocale() {
  const saved = readExplicitLocale()
  if (saved) return saved
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (ZH_TIMEZONES.has(tz)) return 'zh'
  } catch {
    /* ignore */
  }
  const fromNav = normalizeVisitorLocale(
    typeof navigator !== 'undefined' ? navigator.language : '',
  )
  return fromNav || 'pt'
}

export function tLocale(locale, key) {
  const code = normalizeVisitorLocale(locale) || 'pt'
  const bucket = COPY[code] || COPY.pt
  return bucket[key] || COPY.pt[key] || key
}

/** Acrescenta display_lang nas chamadas do widget, mesmo com o script já publicado. */
export function installDisplayLangFetch(locale) {
  const code = normalizeVisitorLocale(locale)
  if (!code || typeof window === 'undefined') return
  window.__mobaDisplayLang = code
  if (window.__mobaFetchPatched) return
  const orig = window.fetch.bind(window)
  window.fetch = (input, init) => {
    try {
      const current = window.__mobaDisplayLang
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url
      if (current && raw && /\/v1\/xchat\/(history|messages|stream)(\?|$)/.test(raw)) {
        const next = new URL(raw, window.location.origin)
        next.searchParams.set('display_lang', current)
        if (typeof input === 'string' || input instanceof URL) {
          input = next.toString()
        } else {
          input = new Request(next.toString(), input)
        }
      }
    } catch {
      /* segue o fetch original */
    }
    return orig(input, init)
  }
  window.__mobaFetchPatched = true
}

const OPERATOR_TOKEN_KEY = 'xbot_operator_token'
const OPERATOR_NAME_KEY = 'xbot_operator_name'
const OPERATOR_EMAIL_KEY = 'xbot_operator_email'

/** Lê `#xbot_user=` aberto pelo app logado, guarda na aba e tira da URL. */
export function captureOperatorToken() {
  if (typeof window === 'undefined') return ''
  try {
    const hash = new URLSearchParams(String(window.location.hash || '').replace(/^#/, ''))
    const fromHash = (hash.get('xbot_user') || '').trim()
    const name = (hash.get('xbot_name') || '').trim().slice(0, 80)
    const email = (hash.get('xbot_email') || '').trim().slice(0, 120)
    if (fromHash) sessionStorage.setItem(OPERATOR_TOKEN_KEY, fromHash)
    if (name) sessionStorage.setItem(OPERATOR_NAME_KEY, name)
    if (email) sessionStorage.setItem(OPERATOR_EMAIL_KEY, email)
    if (fromHash || name || email) {
      hash.delete('xbot_user')
      hash.delete('xbot_name')
      hash.delete('xbot_email')
      const next = hash.toString()
      const url = window.location.pathname + window.location.search + (next ? `#${next}` : '')
      window.history.replaceState(null, '', url)
    }
    return sessionStorage.getItem(OPERATOR_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function readOperatorToken() {
  if (typeof window === 'undefined') return ''
  try {
    return sessionStorage.getItem(OPERATOR_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

/** Grava a sessão aberta pelo SMS, para o chat seguinte ir no nome dessa conta. */
export function storeOperatorSession({ token, name, email } = {}) {
  if (typeof window === 'undefined') return
  try {
    const nextToken = String(token || '').trim()
    const nextName = String(name || '').trim().slice(0, 80)
    const nextEmail = String(email || '').trim().slice(0, 120)
    if (nextToken) sessionStorage.setItem(OPERATOR_TOKEN_KEY, nextToken)
    if (nextName) sessionStorage.setItem(OPERATOR_NAME_KEY, nextName)
    if (nextEmail) sessionStorage.setItem(OPERATOR_EMAIL_KEY, nextEmail)
  } catch {
    /* ignore */
  }
}

/** Nome e e-mail do operador logado, gravados junto com o token. */
export function readOperatorProfile() {
  if (typeof window === 'undefined') return { name: '', email: '' }
  try {
    return {
      name: sessionStorage.getItem(OPERATOR_NAME_KEY) || '',
      email: sessionStorage.getItem(OPERATOR_EMAIL_KEY) || '',
    }
  } catch {
    return { name: '', email: '' }
  }
}

/** Anexa o access token do operador nas mensagens do XChat, sem trocar o Bearer do canal. */
export function installOperatorSessionFetch() {
  if (typeof window === 'undefined') return
  const token = captureOperatorToken()
  if (!token || window.__mobaOperatorFetchPatched) return
  const orig = window.fetch.bind(window)
  window.fetch = (input, init = {}) => {
    try {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url
      const current = sessionStorage.getItem(OPERATOR_TOKEN_KEY) || ''
      if (current && raw && /\/v1\/xchat\/message(\?|$)/.test(raw)) {
        const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined))
        if (!headers.has('X-XBot-User-Authorization')) {
          headers.set('X-XBot-User-Authorization', `Bearer ${current}`)
        }
        init = { ...init, headers }
      }
    } catch {
      /* segue o fetch original */
    }
    return orig(input, init)
  }
  window.__mobaOperatorFetchPatched = true
}
