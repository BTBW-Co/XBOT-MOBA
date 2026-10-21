import { readVisitorIdentity, storeVisitorIdentity } from '../lib/mobaVisitorIdentity'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneCountryField from '../components/PhoneCountryField'
import TurnstileCheck from '../components/TurnstileCheck'
import { fetchCurrentTerm, savePhoneProfile, startPhoneChallenge, verifyPhoneChallenge } from '../api/moba'
import { getCountryCallingCode } from 'libphonenumber-js/min'
import { resolvePhone, suggestIso } from '../lib/phoneInput'
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
  if (code === 'invalid_profile') return copy(locale, 'profileInvalid')
  if (code === 'email_in_use') return copy(locale, 'emailInUse')
  if (code === 'terms_required') return copy(locale, 'termsRequired')
  if (code === 'turnstile_failed' || code === 'turnstile_required') return copy(locale, 'humanCheckFailed')
  if (code && !String(code).startsWith('HTTP ')) return code
  return ''
}

function legalUrl(locale, page) {
  const code = ['pt', 'en', 'es', 'zh'].includes(locale) ? locale : 'pt'
  return `https://xbotone.com/${code}/${page}`
}

function initialPhone() {
  const iso = suggestIso('pt', typeof navigator !== 'undefined' ? navigator.language : '')
  return { iso, digits: getCountryCallingCode(iso) }
}

export default function MobaPhoneHome() {
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const objectRef = params.get('object_id') || SITE_CHANNEL
  const pin = sessionStorage.getItem(`moba.pin.${objectRef}`) || ''
  const [locale, setLocale] = useState('pt')
  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState('phone')
  const [phoneField, setPhoneField] = useState(initialPhone)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [phone, setPhone] = useState('')
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visitor, setVisitor] = useState(null)
  const [term, setTerm] = useState(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [profile, setProfile] = useState({ givenName: '', familyName: '', gender: '', email: '', company: '', password: '' })
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

  async function sendCode(nextPhone, token = turnstileToken) {
    setLoading(true)
    setError('')
    try {
      await startPhoneChallenge({ phone: nextPhone, locale, objectId: objectRef, pin, turnstileToken: token })
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
    const resolved = resolvePhone(phoneField.digits, phoneField.iso)
    if (resolved.pending || resolved.e164.length < 10 || resolved.e164.length > 15) {
      setError(copy(locale, 'phoneInvalid'))
      return
    }
    if (!turnstileToken) {
      setError(copy(locale, 'humanRequired'))
      return
    }
    await sendCode(resolved.e164, turnstileToken)
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
      if (data.needs_profile) {
        setVisitor(data)
        setPhase('profile')
        fetchCurrentTerm().then((current) => setTerm(current)).catch(() => setTerm(null))
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

  async function submitProfile(event) {
    event.preventDefault()
    const givenName = profile.givenName.trim()
    const familyName = profile.familyName.trim()
    const email = profile.email.trim()
    const company = profile.company.trim()
    if (givenName.length < 2 || familyName.length < 2 || !profile.gender || !email.includes('@') || company.length < 2 || profile.password.length < 8) {
      setError(copy(locale, 'profileInvalid'))
      return
    }
    if (term?.id && !acceptTerms) {
      setError(copy(locale, 'termsRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await savePhoneProfile({
        visitor_id: visitor.visitor_id,
        given_name: givenName,
        family_name: familyName,
        gender: profile.gender,
        email,
        company_name: company,
        password: profile.password,
        accept_terms_id: term?.id || null,
        locale,
        object_id: objectRef,
        pin: pin || null,
      })
      enterConversation({ ...visitor, name: `${givenName} ${familyName}`.trim(), email, phone: visitor.phone || phone })
    } catch (err) {
      setError(errorText(locale, err?.detail) || copy(locale, 'profileInvalid'))
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

  const title =
    phase === 'phone' ? copy(locale, 'phoneTitle') : phase === 'code' ? copy(locale, 'codeTitle') : copy(locale, 'profileTitle')
  const subtitle =
    phase === 'phone'
      ? copy(locale, 'phoneSubtitle')
      : phase === 'code'
        ? copy(locale, 'codeSubtitle', { phone })
        : copy(locale, 'profileSubtitle')

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
            <PhoneCountryField
              locale={locale}
              digits={phoneField.digits}
              iso={phoneField.iso}
              autoFocus
              searchLabel={copy(locale, 'countrySearch')}
              emptyLabel={copy(locale, 'countryEmpty')}
              onChange={setPhoneField}
            />
            <p className="moba-gate-consent">
              {copy(locale, 'phoneConsentLead', { action: copy(locale, 'phoneSend') })}
              <a href={legalUrl(locale, 'terms')} target="_blank" rel="noreferrer">
                {copy(locale, 'phoneTerms')}
              </a>
              {copy(locale, 'phoneConsentMid')}
              <a href={legalUrl(locale, 'terms')} target="_blank" rel="noreferrer">
                {copy(locale, 'phoneSms')}
              </a>
              {copy(locale, 'phoneConsentAnd')}
              <a href={legalUrl(locale, 'privacy')} target="_blank" rel="noreferrer">
                {copy(locale, 'phonePrivacy')}
              </a>
              {copy(locale, 'phoneConsentEnd')}
            </p>
            <TurnstileCheck
              locale={locale}
              failedMessage={copy(locale, 'humanCheckFailed')}
              retryLabel={copy(locale, 'humanRetry')}
              onToken={setTurnstileToken}
            />
            {error ? <p className="moba-gate-error">{error}</p> : null}
            <button className="moba-gate-submit" type="submit" disabled={loading || !turnstileToken}>
              {loading ? copy(locale, 'phoneSending') : copy(locale, 'phoneSend')}
              {loading ? null : <span aria-hidden="true"> →</span>}
            </button>
          </form>
        ) : phase === 'code' ? (
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
        ) : (
          <form className="moba-gate-form" onSubmit={submitProfile}>
            <label className="moba-gate-label" htmlFor="moba-given">{copy(locale, 'profileGiven')}</label>
            <input
              id="moba-given"
              className="moba-gate-input moba-gate-field"
              autoComplete="given-name"
              autoFocus
              value={profile.givenName}
              onChange={(event) => setProfile({ ...profile, givenName: event.target.value })}
            />
            <label className="moba-gate-label" htmlFor="moba-family">{copy(locale, 'profileFamily')}</label>
            <input
              id="moba-family"
              className="moba-gate-input moba-gate-field"
              autoComplete="family-name"
              value={profile.familyName}
              onChange={(event) => setProfile({ ...profile, familyName: event.target.value })}
            />
            <label className="moba-gate-label" htmlFor="moba-gender">{copy(locale, 'profileGender')}</label>
            <select
              id="moba-gender"
              className="moba-gate-input moba-gate-field"
              value={profile.gender}
              onChange={(event) => setProfile({ ...profile, gender: event.target.value })}
            >
              <option value="">{copy(locale, 'profileGender')}</option>
              <option value="female">{copy(locale, 'genderFemale')}</option>
              <option value="male">{copy(locale, 'genderMale')}</option>
              <option value="other">{copy(locale, 'genderOther')}</option>
              <option value="undisclosed">{copy(locale, 'genderUndisclosed')}</option>
            </select>
            <label className="moba-gate-label" htmlFor="moba-email">{copy(locale, 'profileEmail')}</label>
            <input
              id="moba-email"
              className="moba-gate-input moba-gate-field"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            />
            <label className="moba-gate-label" htmlFor="moba-company">{copy(locale, 'profileCompany')}</label>
            <input
              id="moba-company"
              className="moba-gate-input moba-gate-field"
              autoComplete="organization"
              value={profile.company}
              onChange={(event) => setProfile({ ...profile, company: event.target.value })}
            />
            <label className="moba-gate-label" htmlFor="moba-password">{copy(locale, 'profilePassword')}</label>
            <input
              id="moba-password"
              className="moba-gate-input moba-gate-field"
              type="password"
              autoComplete="new-password"
              value={profile.password}
              onChange={(event) => setProfile({ ...profile, password: event.target.value })}
            />
            {term?.id ? (
              <label className="moba-gate-check">
                <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
                <span>{copy(locale, 'profileTerms')}</span>
              </label>
            ) : null}
            {error ? <p className="moba-gate-error">{error}</p> : null}
            <button className="moba-gate-submit" type="submit" disabled={loading}>
              {loading ? copy(locale, 'profileSaving') : copy(locale, 'profileSave')}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
