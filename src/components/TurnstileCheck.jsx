import { useEffect, useRef, useState } from 'react'

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TEST_SITE_KEY = '1x00000000000000000000AA'

function widgetLanguage(locale) {
  if (locale === 'pt') return 'pt-BR'
  if (locale === 'zh') return 'zh-CN'
  if (locale === 'es') return 'es'
  return 'en'
}

export default function TurnstileCheck({ locale, failedMessage, retryLabel, onToken }) {
  const el = useRef(null)
  const widgetId = useRef(null)
  const onTokenRef = useRef(onToken)
  const [failed, setFailed] = useState(false)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || TEST_SITE_KEY
  onTokenRef.current = onToken

  useEffect(() => {
    let cancelled = false

    function markFailed() {
      if (cancelled) return
      setFailed(true)
      onTokenRef.current('')
    }

    function renderWidget() {
      if (cancelled || !el.current || !window.turnstile || widgetId.current) return
      widgetId.current = window.turnstile.render(el.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'flexible',
        appearance: 'always',
        language: widgetLanguage(locale),
        callback: (token) => {
          if (cancelled) return
          setFailed(false)
          onTokenRef.current(token || '')
        },
        'error-callback': markFailed,
        'expired-callback': () => onTokenRef.current(''),
        'timeout-callback': markFailed,
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      let script = document.querySelector('script[data-turnstile]')
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT
        script.async = true
        script.defer = true
        script.dataset.turnstile = '1'
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderWidget)
      script.addEventListener('error', markFailed)
    }

    return () => {
      cancelled = true
      if (widgetId.current != null && window.turnstile) {
        window.turnstile.remove(widgetId.current)
      }
      widgetId.current = null
    }
  }, [locale, siteKey])

  function retry() {
    setFailed(false)
    onTokenRef.current('')
    if (widgetId.current != null && window.turnstile) {
      window.turnstile.reset(widgetId.current)
    }
  }

  return (
    <div className="moba-turnstile">
      <div ref={el} className="moba-turnstile-slot" />
      {failed ? (
        <p className="moba-turnstile-error">
          {failedMessage}{' '}
          <button type="button" onClick={retry}>
            {retryLabel}
          </button>
        </p>
      ) : null}
    </div>
  )
}
