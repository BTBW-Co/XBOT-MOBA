import MobaLocaleSwitch from '../components/MobaLocaleSwitch'
import { tLocale } from '../lib/visitorLocale'

export const XBOT_SITE_URL = 'https://xbotone.com'

function humanizeError(error, notFound, locale) {
  const text = (key) => tLocale(locale, key)
  if (notFound) {
    return {
      title: text('notFoundTitle'),
      detail: text('notFoundDetail'),
    }
  }

  const raw = String(error || '')
  const lower = raw.toLowerCase()

  if (lower.includes('inválido') || lower.includes('invalid') || lower.includes('无效')) {
    return {
      title: text('invalidTitle'),
      detail: text('invalidDetail'),
    }
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('load failed') ||
    /\bhttp 5\d\d\b/.test(lower)
  ) {
    return {
      title: text('networkTitle'),
      detail: text('networkDetail'),
    }
  }

  if (lower.includes('http 404') || lower.includes('not found') || lower.includes('não encontr') || lower.includes('找不到')) {
    return {
      title: text('missingTitle'),
      detail: text('missingDetail'),
    }
  }

  return {
    title: text('genericTitle'),
    detail: text('genericDetail'),
  }
}

function MobaErrorMark() {
  return (
    <svg
      className="moba-error-mark"
      viewBox="0 0 180 180"
      width="180"
      height="180"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="moba-error-clip">
          <circle cx="90" cy="90" r="60" />
        </clipPath>
        <radialGradient id="moba-error-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d4a4" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#5BB8E8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle className="moba-error-aura" cx="90" cy="90" r="82" fill="url(#moba-error-glow)" />
      <circle className="moba-error-ring moba-error-ring--a" cx="90" cy="90" r="68" />
      <circle className="moba-error-ring moba-error-ring--b" cx="90" cy="90" r="80" />

      <g className="moba-error-bot">
        <g clipPath="url(#moba-error-clip)">
          <image href="/brand/icon-blue.jpg" x="30" y="30" width="120" height="120" />
        </g>
      </g>
    </svg>
  )
}

export default function MobaErrorScreen({ error, notFound = false, locale = 'pt' }) {
  const { title, detail } = humanizeError(error, notFound, locale)

  return (
    <main className="moba-error" role="alert">
      <MobaLocaleSwitch locale={locale} className="moba-locale--error" />
      <MobaErrorMark />
      <p className="moba-error-kicker" aria-hidden="true">
        <span className="moba-error-kicker-dot" />
        xbot
      </p>
      <h1>{title}</h1>
      <p className="moba-error-copy">{detail}</p>
      <a
        className="moba-error-cta"
        href={XBOT_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tLocale(locale, 'cta')}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3.5 8h9M8.5 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </main>
  )
}
