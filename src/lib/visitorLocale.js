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
