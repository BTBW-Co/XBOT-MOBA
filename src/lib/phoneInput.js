import { AsYouType, getCountries, getCountryCallingCode } from 'libphonenumber-js/min'

/** Quando o DDI é compartilhado e o número ainda não distingue o país. */
const PREFERRED_ISO = {
  1: 'US',
  7: 'RU',
  39: 'IT',
  44: 'GB',
  47: 'NO',
  61: 'AU',
  212: 'MA',
  262: 'RE',
  290: 'SH',
  358: 'FI',
  590: 'GP',
  599: 'CW',
}

const callingIndex = new Map()
for (const iso of getCountries()) {
  const code = getCountryCallingCode(iso)
  if (!callingIndex.has(code)) callingIndex.set(code, [])
  callingIndex.get(code).push(iso)
}

export function countryFlagEmoji(iso) {
  const code = String(iso || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return ''
  return String.fromCodePoint(0x1f1e6 + code.charCodeAt(0) - 65, 0x1f1e6 + code.charCodeAt(1) - 65)
}

function regionName(names, iso) {
  try {
    return names.of(iso) || iso
  } catch {
    return iso
  }
}

export function isoForCalling(callingCode) {
  const code = String(callingCode || '')
  const list = callingIndex.get(code) || []
  const preferred = PREFERRED_ISO[code]
  if (preferred && list.includes(preferred)) return preferred
  return list[0] || ''
}

/** exact = DDI de um país. prefix = ainda incompleto. invalid = não existe. */
export function classifyCalling(callingCode) {
  const code = String(callingCode || '')
  if (!code) return 'empty'
  if (callingIndex.has(code)) return 'exact'
  for (const known of callingIndex.keys()) {
    if (known.startsWith(code)) return 'prefix'
  }
  return 'invalid'
}

function isoForExactCalling(callingCode, preferredIso) {
  const fallback = getCountries().includes(preferredIso) ? preferredIso : 'BR'
  if (getCountryCallingCode(fallback) === callingCode) return fallback
  return isoForCalling(callingCode) || fallback
}

export function suggestIso(locale, language = '') {
  const region = String(language || '').split('-')[1] || ''
  if (/^[a-zA-Z]{2}$/.test(region)) {
    const iso = region.toUpperCase()
    if (getCountries().includes(iso)) return iso
  }
  if (locale === 'pt') return 'BR'
  if (locale === 'es') return 'ES'
  if (locale === 'zh') return 'CN'
  return 'US'
}

export function listCountries(locale) {
  const names = new Intl.DisplayNames([locale || 'en'], { type: 'region' })
  return getCountries()
    .map((iso) => ({
      iso,
      code: getCountryCallingCode(iso),
      name: regionName(names, iso),
      flag: countryFlagEmoji(iso),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale || 'en'))
}

/** Máscara nacional do país, com o DDI na frente. Vazio mostra só o código. */
export function displayPhone(iso, national) {
  const calling = getCountryCallingCode(iso)
  const digits = String(national || '').replace(/\D/g, '')
  if (!digits) return `+${calling}`
  return `+${calling} ${new AsYouType(iso).input(digits)}`
}

/**
 * Lê os dígitos do campo (DDI + nacional).
 * Código incompleto fica pendente e não troca o país.
 * Código reconhecido troca o país, exceto quando o DDI continua o mesmo (EUA/Canadá).
 */
export function resolvePhone(digits, preferredIso = 'BR') {
  const clean = String(digits || '').replace(/\D/g, '').slice(0, 15)
  const fallback = getCountries().includes(preferredIso) ? preferredIso : 'BR'
  const fallbackCalling = getCountryCallingCode(fallback)
  if (!clean) {
    return { iso: fallback, national: '', pending: false, display: `+${fallbackCalling}`, e164: '' }
  }
  const typer = new AsYouType()
  typer.input(`+${clean}`)
  const calling = typer.getCallingCode() || ''
  if (!calling || !clean.startsWith(calling)) {
    return { iso: fallback, national: '', pending: true, display: `+${clean}`, e164: '' }
  }
  let iso = fallback
  if (getCountryCallingCode(fallback) !== calling) {
    iso = typer.getCountry() || isoForCalling(calling) || fallback
  }
  const national = clean.slice(calling.length)
  return {
    iso,
    national,
    pending: false,
    display: displayPhone(iso, national),
    e164: `${calling}${national}`,
  }
}

/** Separa o DDI digitado do número nacional quando há um separador depois do código. */
export function splitPhoneInput(raw) {
  const match = String(raw ?? '').match(/^\s*\+?(\d*)([\s\S]*)$/)
  const head = match?.[1] || ''
  const tail = match?.[2] || ''
  if (tail && /\D/.test(tail[0])) {
    return {
      separated: true,
      calling: head.slice(0, 3),
      national: tail.replace(/\D/g, '').slice(0, 15),
    }
  }
  return { separated: false, digits: (head + tail).replace(/\D/g, '').slice(0, 15) }
}

function draftPhone(iso, calling, national) {
  const local = String(national || '').replace(/\D/g, '')
  if (!calling && !local) return '+'
  if (!local) return `+${calling}`
  const formatted = new AsYouType(iso).input(local)
  return `+${calling} ${formatted}`.trimEnd()
}

/**
 * Lê o que foi digitado no campo.
 * DDI válido troca o país. DDI incompleto ou inexistente mantém a última bandeira e fica pendente.
 */
export function readPhoneField(raw, preferredIso = 'BR') {
  const fallback = getCountries().includes(preferredIso) ? preferredIso : 'BR'
  const split = splitPhoneInput(raw)
  if (!split.separated) {
    const parsed = resolvePhone(split.digits, fallback)
    return {
      iso: parsed.pending ? fallback : parsed.iso,
      digits: split.digits,
      pending: parsed.pending,
      display: parsed.display,
    }
  }
  const calling = split.calling
  const national = split.national.slice(0, Math.max(0, 15 - calling.length))
  if (classifyCalling(calling) === 'exact') {
    const iso = isoForExactCalling(calling, fallback)
    const digits = `${calling}${national}`.slice(0, 15)
    const parsed = resolvePhone(digits, iso)
    return { iso: parsed.iso, digits, pending: false, display: parsed.display }
  }
  return {
    iso: fallback,
    digits: `${calling}${national}`.slice(0, 15),
    pending: true,
    display: draftPhone(fallback, calling, national),
  }
}

export function digitsForCountry(nextIso, currentDigits, currentIso) {
  const current = resolvePhone(currentDigits, currentIso)
  const national = current.pending ? '' : current.national
  return `${getCountryCallingCode(nextIso)}${national}`.slice(0, 15)
}

/** Posição do cursor depois de `count` dígitos na máscara. */
export function caretForDigitCount(value, count) {
  if (!count) return 0
  let seen = 0
  for (let i = 0; i < value.length; i += 1) {
    if (/\d/.test(value[i])) {
      seen += 1
      if (seen === count) return i + 1
    }
  }
  return value.length
}
