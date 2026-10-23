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
    recording: 'Gravando',
    recordingCancel: 'Descartar gravação',
    recordingSend: 'Enviar áudio',
    assistantRole: 'Assistente pessoal',
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
    phoneSubtitle: 'O código sai na hora, por SMS ou WhatsApp. A verificação precisa ser concluída para continuar.',
    phoneLabel: 'Número de telefone',
    countryCode: 'Código do país',
    countrySearch: 'Buscar país ou código',
    countryEmpty: 'Nenhum país encontrado',
    phonePlaceholder: '54 99999-9999',
    phoneSend: 'Enviar código por SMS',
    phoneSendWhatsapp: 'Enviar por WhatsApp',
    phoneConsentLead: 'Ao pedir o código, você concorda com os ',
    phoneTerms: 'Termos de Uso',
    phoneConsentMid: ' e os ',
    phoneSms: 'Termos de SMS',
    phoneConsentAnd: ' e reconhece a ',
    phonePrivacy: 'Política de Privacidade',
    phoneConsentEnd: '.',
    humanCheckFailed: 'Não conseguimos concluir a verificação do navegador. Tente de novo para pedir o código.',
    humanRetry: 'Tentar a verificação de novo',
    humanRequired: 'Confirme que você é humano para pedir o código.',
    phoneSending: 'Enviando…',
    phoneInvalid: 'Informe o número completo, com DDI e DDD.',
    phoneLimited: 'Muitas tentativas neste número. Espere um pouco e tente de novo.',
    phoneSendFailed: 'Não foi possível enviar o SMS. Tente de novo.',
    phoneWhatsappFailed: 'Não foi possível enviar pelo WhatsApp. Tente de novo.',
    phoneWhatsappUnavailable: 'O WhatsApp do XBot não está conectado agora.',
    codeTitle: 'Digite o código',
    codeSubtitle: 'Enviamos um código de 6 dígitos por {channel} para +{phone}.',
    codeDigit: 'Dígito {n}',
    codeConfirm: 'Confirmar',
    codeChecking: 'Conferindo…',
    codeInvalid: 'Código inválido. Digite os 6 números de novo.',
    codeExpired: 'Esse código expirou. Peça outro.',
    changeNumber: 'Trocar número',
    resendCode: 'Reenviar por SMS',
    resendWhatsapp: 'Reenviar por WhatsApp',
    phoneUnknown: 'Esse número ainda não está numa conta.',
    profileTitle: 'Conta pra gente quem é você',
    profileSubtitle: 'É o primeiro acesso deste número. Nos próximos, o telefone já entra direto.',
    profileGiven: 'Nome',
    profileFamily: 'Sobrenome',
    profileGender: 'Gênero',
    genderFemale: 'Feminino',
    genderMale: 'Masculino',
    genderOther: 'Outro',
    genderUndisclosed: 'Prefiro não informar',
    profileEmail: 'E-mail',
    profileTerms: 'Li e aceito o termo de responsabilidade.',
    profileSave: 'Continuar',
    profileSaving: 'Salvando…',
    profileInvalid: 'Preencha nome, sobrenome, gênero e um e-mail válido.',
    emailInUse: 'Esse e-mail já está em outra conta.',
    termsRequired: 'Aceite o termo para continuar.',
    channelTitle: 'Por onde você quer conversar?',
    channelSubtitle: 'O mesmo assistente no MOBA e no WhatsApp do XBot. iMessage entra logo.',
    channelMoba: 'Continuar no MOBA',
    channelWhatsapp: 'Continuar no WhatsApp do XBot',
    channelImessage: 'iMessage',
    channelSoon: 'Em breve',
    channelSending: 'Chamando no WhatsApp…',
    channelWhatsappSent: 'Mandei um oi no seu WhatsApp, pela linha do XBot. A conversa segue por lá do mesmo jeito. Aqui também continua o mesmo assistente.',
    channelImessageSoon: 'iMessage entra logo. Até lá, esta conversa é a mesma no MOBA e no WhatsApp do XBot.',
    channelLineDown: 'O WhatsApp do XBot ainda não está conectado.',
    channelSendFailed: 'Não consegui chamar no WhatsApp do XBot. Pode continuar por aqui.',
    accountSetup: 'Configurar contas',
    shareInvite: 'Compartilhar convite',
    inviteCopy: 'Copiar link',
    inviteCopied: 'Link copiado',
  },
  en: {
    langLabel: 'Language',
    placeholder: 'Ask anything',
    recording: 'Recording',
    recordingCancel: 'Discard recording',
    recordingSend: 'Send audio',
    assistantRole: 'Personal assistant',
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
    phoneSubtitle: "We'll send a code right away, by text or WhatsApp. Verification has to be finished before you continue.",
    phoneLabel: 'Phone number',
    countryCode: 'Country code',
    countrySearch: 'Search country or code',
    countryEmpty: 'No country found',
    phonePlaceholder: '415 555 0134',
    phoneSend: 'Send code by text',
    phoneSendWhatsapp: 'Send by WhatsApp',
    phoneConsentLead: 'By asking for the code, I agree to xbot\'s ',
    phoneTerms: 'Terms of Service',
    phoneConsentMid: ' and ',
    phoneSms: 'SMS Terms',
    phoneConsentAnd: ', and acknowledge the ',
    phonePrivacy: 'Privacy Policy',
    phoneConsentEnd: '.',
    humanCheckFailed: 'We couldn\'t finish checking your browser. Retry the check to request a code.',
    humanRetry: 'Retry browser check',
    humanRequired: 'Confirm you are human before requesting a code.',
    phoneSending: 'Sending…',
    phoneInvalid: 'Enter the full number, including the country code.',
    phoneLimited: 'Too many attempts for this number. Wait a moment and try again.',
    phoneSendFailed: "We couldn't send the text. Try again.",
    phoneWhatsappFailed: "We couldn't send it on WhatsApp. Try again.",
    phoneWhatsappUnavailable: "XBot's WhatsApp isn't connected right now.",
    codeTitle: 'Enter the code',
    codeSubtitle: 'We sent a 6-digit code by {channel} to +{phone}.',
    codeDigit: 'Digit {n}',
    codeConfirm: 'Confirm',
    codeChecking: 'Checking…',
    codeInvalid: "That code doesn't match. Enter all 6 digits again.",
    codeExpired: 'That code expired. Ask for another one.',
    changeNumber: 'Change number',
    resendCode: 'Resend by text',
    resendWhatsapp: 'Resend by WhatsApp',
    phoneUnknown: 'This number is not on an account yet.',
    profileTitle: 'Tell us who you are',
    profileSubtitle: 'This is the first time for this number. Next time the phone brings you straight in.',
    profileGiven: 'First name',
    profileFamily: 'Last name',
    profileGender: 'Gender',
    genderFemale: 'Female',
    genderMale: 'Male',
    genderOther: 'Other',
    genderUndisclosed: 'Prefer not to say',
    profileEmail: 'Email',
    profileTerms: 'I have read and accept the terms.',
    profileSave: 'Continue',
    profileSaving: 'Saving…',
    profileInvalid: 'Fill in first name, last name, gender and a valid email.',
    emailInUse: 'That email is already on another account.',
    termsRequired: 'Accept the terms to continue.',
    channelTitle: 'Where do you want to talk?',
    channelSubtitle: 'The same assistant on MOBA and on XBot WhatsApp. iMessage is next.',
    channelMoba: 'Continue on MOBA',
    channelWhatsapp: 'Continue on XBot WhatsApp',
    channelImessage: 'iMessage',
    channelSoon: 'Soon',
    channelSending: 'Opening WhatsApp…',
    channelWhatsappSent: 'I sent a hello on your WhatsApp from the XBot line. The conversation continues there the same way. This screen stays the same assistant too.',
    channelImessageSoon: 'iMessage is next. Until then, this conversation is the same on MOBA and on XBot WhatsApp.',
    channelLineDown: 'XBot WhatsApp is not connected yet.',
    channelSendFailed: 'I could not reach you on XBot WhatsApp. You can continue here.',
    accountSetup: 'Set up accounts',
    shareInvite: 'Share invite',
    inviteCopy: 'Copy link',
    inviteCopied: 'Link copied',
  },
  es: {
    langLabel: 'Idioma',
    placeholder: 'Pregunta lo que quieras',
    recording: 'Grabando',
    recordingCancel: 'Descartar grabación',
    recordingSend: 'Enviar audio',
    assistantRole: 'Asistente personal',
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
    phoneSubtitle: 'El código sale ahora, por SMS o WhatsApp. La verificación tiene que completarse para seguir.',
    phoneLabel: 'Número de teléfono',
    countryCode: 'Código de país',
    countrySearch: 'Buscar país o código',
    countryEmpty: 'Ningún país encontrado',
    phonePlaceholder: '11 5555 0134',
    phoneSend: 'Enviar código por SMS',
    phoneSendWhatsapp: 'Enviar por WhatsApp',
    phoneConsentLead: 'Al pedir el código, aceptas los ',
    phoneTerms: 'Términos de uso',
    phoneConsentMid: ' y los ',
    phoneSms: 'Términos de SMS',
    phoneConsentAnd: ' y reconoces la ',
    phonePrivacy: 'Política de privacidad',
    phoneConsentEnd: '.',
    humanCheckFailed: 'No pudimos terminar de comprobar tu navegador. Reintenta la verificación para pedir el código.',
    humanRetry: 'Reintentar la verificación',
    humanRequired: 'Confirma que eres humano para pedir el código.',
    phoneSending: 'Enviando…',
    phoneInvalid: 'Escribe el número completo, con el código de país.',
    phoneLimited: 'Demasiados intentos para este número. Espera un momento e inténtalo de nuevo.',
    phoneSendFailed: 'No pudimos enviar el SMS. Inténtalo de nuevo.',
    phoneWhatsappFailed: 'No pudimos enviarlo por WhatsApp. Inténtalo de nuevo.',
    phoneWhatsappUnavailable: 'El WhatsApp de XBot no está conectado ahora.',
    codeTitle: 'Escribe el código',
    codeSubtitle: 'Enviamos un código de 6 dígitos por {channel} a +{phone}.',
    codeDigit: 'Dígito {n}',
    codeConfirm: 'Confirmar',
    codeChecking: 'Comprobando…',
    codeInvalid: 'El código no coincide. Escribe los 6 números otra vez.',
    codeExpired: 'Ese código expiró. Pide otro.',
    changeNumber: 'Cambiar número',
    resendCode: 'Reenviar por SMS',
    resendWhatsapp: 'Reenviar por WhatsApp',
    phoneUnknown: 'Este número todavía no está en una cuenta.',
    profileTitle: 'Cuéntanos quién eres',
    profileSubtitle: 'Es el primer acceso de este número. La próxima vez el teléfono entra directo.',
    profileGiven: 'Nombre',
    profileFamily: 'Apellido',
    profileGender: 'Género',
    genderFemale: 'Femenino',
    genderMale: 'Masculino',
    genderOther: 'Otro',
    genderUndisclosed: 'Prefiero no decirlo',
    profileEmail: 'Correo',
    profileTerms: 'Leí y acepto el término de responsabilidad.',
    profileSave: 'Continuar',
    profileSaving: 'Guardando…',
    profileInvalid: 'Completa nombre, apellido, género y un correo válido.',
    emailInUse: 'Ese correo ya está en otra cuenta.',
    termsRequired: 'Acepta el término para continuar.',
    channelTitle: '¿Por dónde quieres conversar?',
    channelSubtitle: 'El mismo asistente en MOBA y en el WhatsApp de XBot. iMessage llega pronto.',
    channelMoba: 'Seguir en MOBA',
    channelWhatsapp: 'Seguir en el WhatsApp de XBot',
    channelImessage: 'iMessage',
    channelSoon: 'Pronto',
    channelSending: 'Llamando por WhatsApp…',
    channelWhatsappSent: 'Te mandé un hola por WhatsApp, desde la línea de XBot. La conversación sigue allí igual. Aquí también sigue el mismo asistente.',
    channelImessageSoon: 'iMessage llega pronto. Hasta entonces, esta conversación es la misma en MOBA y en el WhatsApp de XBot.',
    channelLineDown: 'El WhatsApp de XBot todavía no está conectado.',
    channelSendFailed: 'No pude llamarte por el WhatsApp de XBot. Puedes seguir aquí.',
    accountSetup: 'Configurar cuentas',
    shareInvite: 'Compartir invitación',
    inviteCopy: 'Copiar enlace',
    inviteCopied: 'Enlace copiado',
  },
  zh: {
    langLabel: '语言',
    placeholder: '随便问',
    recording: '录音中',
    recordingCancel: '放弃录音',
    recordingSend: '发送语音',
    assistantRole: '个人助理',
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
    phoneSubtitle: '验证码会马上发出，可以用短信或 WhatsApp。验证完成之后才能继续。',
    phoneLabel: '手机号',
    countryCode: '国家代码',
    countrySearch: '搜索国家或区号',
    countryEmpty: '没有找到国家',
    phonePlaceholder: '138 0000 0000',
    phoneSend: '用短信发送验证码',
    phoneSendWhatsapp: '用 WhatsApp 发送',
    phoneConsentLead: '请求验证码即表示你同意 xbot 的',
    phoneTerms: '使用条款',
    phoneConsentMid: '和',
    phoneSms: '短信条款',
    phoneConsentAnd: '，并确认',
    phonePrivacy: '隐私政策',
    phoneConsentEnd: '。',
    humanCheckFailed: '我们无法完成浏览器验证。请重试后再请求验证码。',
    humanRetry: '重新验证浏览器',
    humanRequired: '请先确认你是人类，再请求验证码。',
    phoneSending: '发送中…',
    phoneInvalid: '请填写完整号码，包括国家代码。',
    phoneLimited: '这个号码尝试次数太多。请稍后再试。',
    phoneSendFailed: '短信没有发出去。请再试一次。',
    phoneWhatsappFailed: 'WhatsApp 没有发出去。请再试一次。',
    phoneWhatsappUnavailable: 'XBot 的 WhatsApp 现在没有连接。',
    codeTitle: '输入验证码',
    codeSubtitle: '我们通过 {channel} 向 +{phone} 发送了 6 位验证码。',
    codeDigit: '第 {n} 位',
    codeConfirm: '确认',
    codeChecking: '正在核对…',
    codeInvalid: '验证码不正确。请重新输入 6 位数字。',
    codeExpired: '这个验证码已过期。请重新获取。',
    changeNumber: '更换号码',
    resendCode: '用短信重发',
    resendWhatsapp: '用 WhatsApp 重发',
    phoneUnknown: '这个号码还没有对应的账号。',
    profileTitle: '先告诉我你是谁',
    profileSubtitle: '这是这个号码的第一次访问。下次用同一号码会直接进入。',
    profileGiven: '名',
    profileFamily: '姓',
    profileGender: '性别',
    genderFemale: '女',
    genderMale: '男',
    genderOther: '其他',
    genderUndisclosed: '不愿透露',
    profileEmail: '邮箱',
    profileTerms: '我已阅读并接受责任条款。',
    profileSave: '继续',
    profileSaving: '正在保存…',
    profileInvalid: '请填写名、姓、性别和有效邮箱。',
    emailInUse: '这个邮箱已经属于另一个账号。',
    termsRequired: '请先接受条款。',
    channelTitle: '你想在哪里继续聊？',
    channelSubtitle: 'MOBA 和 XBot 的 WhatsApp 是同一个助手。iMessage 即将开放。',
    channelMoba: '继续用 MOBA',
    channelWhatsapp: '继续用 XBot 的 WhatsApp',
    channelImessage: 'iMessage',
    channelSoon: '即将开放',
    channelSending: '正在打开 WhatsApp…',
    channelWhatsappSent: '我已经用 XBot 的号码在你的 WhatsApp 上打了招呼。那边的对话是同一个助手。这里也可以继续。',
    channelImessageSoon: 'iMessage 即将开放。在那之前，MOBA 和 XBot 的 WhatsApp 是同一段对话。',
    channelLineDown: 'XBot 的 WhatsApp 还没有接通。',
    channelSendFailed: '没能在 XBot 的 WhatsApp 上联系到你。可以在这里继续。',
    accountSetup: '设置账户',
    shareInvite: '分享邀请',
    inviteCopy: '复制链接',
    inviteCopied: '已复制',
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
