import { readVisitorIdentity, storeVisitorIdentity } from '../lib/mobaVisitorIdentity'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startPhoneChallenge, verifyPhoneChallenge } from '../api/moba'
import {
  normalizeVisitorLocale,
  readExplicitLocale,
  suggestClientLocale,
  tLocale,
  writeExplicitLocale,
} from '../lib/visitorLocale'

const SITE_CHANNEL = '7XGVD9J'
const CODE_LENGTH = 6

function copy(locale, key, vars = {}) {
  let text = tLocale(locale, key)
  Object.entries(vars).forEach(([name, value]) => {
    text = text.split(`{${name}}`).join(String(value))
  })
  return text
}

function errorText(locale, code) {
  if (code === 'invalid_phone') return copy(locale, 'phoneInvalid')
  if (code === 'rate_limited' || code === 'too_many') return copy(locale, 'phoneLimited')
  if (code === 'send_failed') return copy(locale, 'phoneSendFailed')
  if (code === 'expired') return copy(locale, 'codeExpired')
  if (code === 'invalid_code') return copy(locale, 'codeInvalid')
  return ''
}

export default function MobaPhoneHome() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const objectRef = params.get('object_id') || SITE_CHANNEL
  const pin = sessionStorage.getItem(`moba.pin.${objectRef}`) || ''
  const [locale, setLocale] = useState('pt')
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState('phone')
  const [country, setCountry] = useState('55')
  const [national, setNational] = useState('')
  const [phone, setPhone] = useState('')
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRefs = useRef([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = normalizeVisitorLocale(params.get('lang'))
    if (fromQuery && !readExplicitLocale()) writeExplicitLocale(fromQuery)
    setLocale(suggestClientLocale())
    if (readVisitorIdentity()?.objectRef === objectRef) {
      navigate(`/${encodeURIComponent(objectRef)}`, { replace: true })
      return
    }
    setReady(true)
  }, [navigate, objectRef])

  function enterConversation(session) {
    storeVisitorIdentity(session, objectRef)
    navigate(`/${encodeURIComponent(objectRef)}`, { replace: true })
  }

  async function sendCode(nextPhone) {
    setLoading(true)
    setError('')
    try {
      await startPhoneChallenge({ phone: nextPhone, locale, objectId: objectRef, pin })
      setPhone(nextPhone)
      setDigits(Array(CODE_LENGTH).fill(''))
      setPhase('code')
    } catch (err) {
      setError(errorText(locale, err?.detail) || copy(locale, 'phoneSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function submitPhone(event) {
    event.preventDefault()
    const next = `${country}${national}`.replace(/\D/g, '')
    if (next.length < 10 || next.length > 15) {
      setError(copy(locale, 'phoneInvalid'))
      return
    }
    await sendCode(next)
  }

  async function submitCode(code) {
    if (loading || code.length !== CODE_LENGTH) return
    setLoading(true)
    setError('')
    try {
      const data = await verifyPhoneChallenge({ phone, code, objectId: objectRef, pin })
      if (!data?.visitor_id) {
        setDigits(Array(CODE_LENGTH).fill(''))
        setError(copy(locale, 'phoneUnknown'))
        return
      }
      enterConversation(data)
    } catch (err) {
      setDigits(Array(CODE_LENGTH).fill(''))
      setError(errorText(locale, err?.detail) || copy(locale, 'codeInvalid'))
    } finally {
      setLoading(false)
    }
  }

  function onDigit(index, value) {
    const chars = value.replace(/\D/g, '')
    if (!chars) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }
    const next = [...digits]
    chars.split('').forEach((char, offset) => {
      if (index + offset < CODE_LENGTH) next[index + offset] = char
    })
    setDigits(next)
    setError('')
    const focusAt = Math.min(index + chars.length, CODE_LENGTH - 1)
    codeRefs.current[focusAt]?.focus()
    const joined = next.join('')
    if (joined.length === CODE_LENGTH && next.every(Boolean)) {
      void submitCode(joined)
    }
  }

  if (!ready) {
    return <div className="moba-gate" />
  }

  const title = phase === 'phone' ? copy(locale, 'phoneTitle') : copy(locale, 'codeTitle')
  const subtitle =
    phase === 'phone' ? copy(locale, 'phoneSubtitle') : copy(locale, 'codeSubtitle', { phone })

  return (
    <div className="moba-gate">
      <main className="moba-gate-main">
        <img className="moba-gate-icon" src="/onboarding-icon.png" alt="" width="56" height="56" />
        <h1 className="moba-gate-title">{title}</h1>
        <p className="moba-gate-sub">{subtitle}</p>

        {phase === 'phone' ? (
          <form className="moba-gate-form" onSubmit={submitPhone}>
            <label className="moba-gate-label" htmlFor="moba-national">
              {copy(locale, 'phoneLabel')}
            </label>
            <div className="moba-gate-row">
              <input
                className="moba-gate-input moba-gate-country"
                aria-label={copy(locale, 'countryCode')}
                inputMode="numeric"
                autoComplete="tel-country-code"
                value={`+${country}`}
                onChange={(event) => setCountry(event.target.value.replace(/\D/g, '').slice(0, 3))}
              />
              <input
                id="moba-national"
                className="moba-gate-input moba-gate-national"
                inputMode="tel"
                autoComplete="tel-national"
                autoFocus
                value={national}
                placeholder={copy(locale, 'phonePlaceholder')}
                onChange={(event) => setNational(event.target.value.replace(/[^\d\s()-]/g, ''))}
              />
            </div>
            {error ? <p className="moba-gate-error">{error}</p> : null}
            <button className="moba-gate-submit" type="submit" disabled={loading}>
              {loading ? copy(locale, 'phoneSending') : copy(locale, 'phoneSend')}
            </button>
          </form>
        ) : (
          <form
            className="moba-gate-form"
            onSubmit={(event) => {
              event.preventDefault()
              void submitCode(digits.join(''))
            }}
          >
            <div className="moba-gate-digits">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  className="moba-gate-input moba-gate-digit"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  autoFocus={index === 0}
                  maxLength={CODE_LENGTH}
                  value={digit}
                  aria-label={copy(locale, 'codeDigit', { n: index + 1 })}
                  ref={(node) => {
                    codeRefs.current[index] = node
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !digits[index] && index > 0) {
                      codeRefs.current[index - 1]?.focus()
                    }
                  }}
                  onChange={(event) => onDigit(index, event.target.value)}
                />
              ))}
            </div>
            {error ? <p className="moba-gate-error">{error}</p> : null}
            <button
              className="moba-gate-submit"
              type="submit"
              disabled={loading || digits.join('').length !== CODE_LENGTH}
            >
              {loading ? copy(locale, 'codeChecking') : copy(locale, 'codeConfirm')}
            </button>
            <div className="moba-gate-links">
              <button
                type="button"
                onClick={() => {
                  setPhase('phone')
                  setError('')
                  setDigits(Array(CODE_LENGTH).fill(''))
                }}
              >
                {copy(locale, 'changeNumber')}
              </button>
              <button type="button" disabled={loading} onClick={() => void sendCode(phone)}>
                {copy(locale, 'resendCode')}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
