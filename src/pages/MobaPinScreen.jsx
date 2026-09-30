import { useEffect, useRef, useState } from 'react'
import MobaLocaleSwitch from '../components/MobaLocaleSwitch'
import { tLocale } from '../lib/visitorLocale'

const PIN_LEN = 4

function onlyPinChar(raw) {
  const ch = String(raw || '').toUpperCase().replace(/[^0-9A-Z]/g, '')
  return ch.slice(0, 1)
}

export default function MobaPinScreen({
  displayName,
  headline,
  error,
  submitting,
  onSubmit,
  locale = 'pt',
}) {
  const [chars, setChars] = useState(['', '', '', ''])
  const inputsRef = useRef([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  function setAt(index, value) {
    const next = [...chars]
    next[index] = value
    setChars(next)
    if (value && index < PIN_LEN - 1) {
      inputsRef.current[index + 1]?.focus()
    }
    const joined = next.join('')
    if (joined.length === PIN_LEN && !submitting) {
      onSubmit(joined)
    }
  }

  function handleChange(index, event) {
    const value = onlyPinChar(event.target.value.slice(-1))
    setAt(index, value)
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !chars[index] && index > 0) {
      event.preventDefault()
      const next = [...chars]
      next[index - 1] = ''
      setChars(next)
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = String(event.clipboardData.getData('text') || '')
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, '')
      .slice(0, PIN_LEN)
    if (!pasted) return
    const next = ['', '', '', '']
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i]
    setChars(next)
    const focusIdx = Math.min(pasted.length, PIN_LEN - 1)
    inputsRef.current[focusIdx]?.focus()
    if (pasted.length === PIN_LEN && !submitting) onSubmit(pasted)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const joined = chars.join('')
    if (joined.length === PIN_LEN && !submitting) onSubmit(joined)
  }

  return (
    <div className="moba-pin">
      <MobaLocaleSwitch locale={locale} className="moba-locale--pin" />
      <p className="moba-pin-kicker">
        <span className="moba-pin-kicker-dot" />
        {tLocale(locale, 'pinKicker')}
      </p>
      <h1>{headline || displayName || 'MOBA'}</h1>
      <p className="moba-pin-copy">{tLocale(locale, 'pinCopy')}</p>
      <form className="moba-pin-form" onSubmit={handleSubmit}>
        <div className="moba-pin-boxes" onPaste={handlePaste}>
          {chars.map((ch, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el
              }}
              className="moba-pin-box"
              value={ch}
              maxLength={1}
              inputMode="text"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={`PIN ${index + 1}`}
              disabled={submitting}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>
        {error ? <p className="moba-pin-error">{error}</p> : null}
        <button type="submit" className="moba-pin-cta" disabled={chars.join('').length !== PIN_LEN || submitting}>
          {submitting ? tLocale(locale, 'pinChecking') : tLocale(locale, 'pinEnter')}
        </button>
      </form>
    </div>
  )
}
