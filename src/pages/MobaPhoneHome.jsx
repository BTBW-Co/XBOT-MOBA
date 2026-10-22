import { readVisitorIdentity, storeVisitorIdentity } from '../lib/mobaVisitorIdentity'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PhoneCountryField from '../components/PhoneCountryField'
import TurnstileCheck from '../components/TurnstileCheck'
import MobaBootLoader from '../components/MobaBootLoader'
import { bootstrapMoba, choosePersonalChannel, fetchCurrentTerm, fetchInvite, savePhoneProfile, startPhoneChallenge, verifyPhoneChallenge } from '../api/moba'
import { mountXChatFromBootstrap } from '../xchat/mountXChat'
import { getCountryCallingCode } from 'libphonenumber-js/min'
import { canSubmitPhone, resolvePhone, suggestIso } from '../lib/phoneInput'
import {
  normalizeVisitorLocale,
  readExplicitLocale,
  suggestClientLocale,
  tLocale,
  writeExplicitLocale,
} from '../lib/visitorLocale'

const PERSONAL_REF = 'personal'
const CHANNEL_PENDING = 'moba.channel.pending'
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
  if (code === 'invite_closed') return 'Este convite não abre.'
  if (code === 'line_unavailable') return copy(locale, 'channelLineDown')
  if (code === 'whatsapp_failed') return copy(locale, 'channelSendFailed')
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
  return { iso, digits: getCountryCallingCode(iso), pending: false }
}

function PersonalAssistant({ locale }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await bootstrapMoba({ displayLang: locale })
        if (cancelled) return
        await mountXChatFromBootstrap(data, { locale, personal: true })
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      document.body.classList.remove('moba-xchat-live', 'moba-fullscreen', 'moba-has-bg')
      document.documentElement.style.removeProperty('--moba-bg-image')
      document.documentElement.style.removeProperty('--moba-bg-opacity')
    }
  }, [locale])

  if (failed) {
    return (
      <div className="moba-gate">
        <p className="moba-gate-error">{copy(locale, 'bootError')}</p>
      </div>
    )
  }
  return (
    <div className="moba-viewport" aria-busy="true">
      <MobaBootLoader />
    </div>
  )
}

export default function MobaPhoneHome() {
  const navigate = useNavigate()
  const inviteSlug = (useParams().slug || '').trim().toLowerCase()
  const params = new URLSearchParams(window.location.search)
  const explicitObject = (params.get('object_id') || '').trim()
  const personal = !explicitObject
  const objectRef = explicitObject || PERSONAL_REF
  const pin = explicitObject ? (sessionStorage.getItem(`moba.pin.${explicitObject}`) || '') : ''
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
  const [profile, setProfile] = useState({ givenName: '', familyName: '', gender: '', email: '' })
  const [invite, setInvite] = useState(null)
  const [channelNote, setChannelNote] = useState('')
  const codeRefs = useRef([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = normalizeVisitorLocale(params.get('lang'))
    if (fromQuery && !readExplicitLocale()) writeExplicitLocale(fromQuery)
    setLocale(suggestClientLocale())
    const identity = readVisitorIdentity()
    if (personal && identity?.objectRef === PERSONAL_REF) {
      const pending = sessionStorage.getItem(CHANNEL_PENDING) === '1'
      if (pending) setVisitor(identity)
      setPhase(pending ? 'channel' : 'chat')
      setReady(true)
      return
    }
    if (!personal && identity?.objectRef === objectRef) {
      navigate(`/${encodeURIComponent(objectRef)}`, { replace: true })
      return
    }
    setReady(true)
  }, [navigate, objectRef, personal])

  useEffect(() => {
    if (!inviteSlug) return
    let cancelled = false
    fetchInvite(inviteSlug)
      .then((data) => {
        if (!cancelled) setInvite(data)
      })
      .catch(() => {
        if (!cancelled) setInvite({ missing: true })
      })
    return () => {
      cancelled = true
    }
  }, [inviteSlug])

  function enterConversation(session) {
    storeVisitorIdentity(session, objectRef)
    if (personal) {
      sessionStorage.setItem(CHANNEL_PENDING, '1')
      setVisitor(session)
      setChannelNote('')
      setPhase('channel')
      return
    }
    navigate(`/${encodeURIComponent(objectRef)}`, { replace: true })
  }

  function openMoba() {
    sessionStorage.removeItem(CHANNEL_PENDING)
    setPhase('chat')
  }

  async function chooseWhatsapp() {
    setLoading(true)
    setError('')
    setChannelNote('')
    try {
      const identity = visitor?.visitor_id ? visitor : readVisitorIdentity()
      const result = await choosePersonalChannel({
        visitorId: identity?.visitor_id,
        channel: 'whatsapp',
        objectId: explicitObject || null,
        pin,
      })
      sessionStorage.removeItem(CHANNEL_PENDING)
      setChannelNote(copy(locale, 'channelWhatsappSent'))
      if (result?.whatsapp_url) window.location.assign(result.whatsapp_url)
    } catch (err) {
      setError(errorText(locale, err?.detail) || copy(locale, 'channelSendFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function sendCode(nextPhone, token = turnstileToken) {
    setLoading(true)
    setError('')
    try {
      await startPhoneChallenge({
        phone: nextPhone,
        locale,
        objectId: explicitObject || null,
        pin,
        turnstileToken: token,
      })
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
    if (!canSubmitPhone(phoneField.digits, phoneField.iso, phoneField.pending)) {
      setError(copy(locale, 'phoneInvalid'))
      return
    }
    const resolved = resolvePhone(phoneField.digits, phoneField.iso)
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
      const data = await verifyPhoneChallenge({
        phone,
        code,
        objectId: explicitObject || null,
        pin,
      })
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
    if (givenName.length < 2 || familyName.length < 2 || !profile.gender || !email.includes('@')) {
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
        accept_terms_id: term?.id || null,
        locale,
        object_id: explicitObject || null,
        pin: pin || null,
        invite_slug: invite?.missing || invite?.reason === 'full' ? null : inviteSlug || null,
      })
      enterConversation({ ...visitor, name: `${givenName} ${familyName}`.trim(), email, phone: visitor.phone || phone })
    } catch (err) {
      if (err?.detail === 'invite_closed') setInvite({ missing: true })
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

  if (phase === 'chat') {
    return <PersonalAssistant locale={locale} />
  }

  if (inviteSlug && !invite) {
    return (
      <div className="moba-gate" aria-busy="true">
        <main className="moba-gate-main">
          <img className="moba-gate-icon" src="/onboarding-icon.png" alt="" width="56" height="56" />
          <h1 className="moba-gate-title">Convite</h1>
          <p className="moba-gate-sub">Conferindo o convite.</p>
        </main>
      </div>
    )
  }

  if (inviteSlug && invite?.missing) {
    return (
      <div className="moba-gate">
        <main className="moba-gate-main">
          <img className="moba-gate-icon" src="/onboarding-icon.png" alt="" width="56" height="56" />
          <h1 className="moba-gate-title">Convite</h1>
          <p className="moba-gate-sub">Este convite não abre.</p>
        </main>
      </div>
    )
  }

  const phoneReady = canSubmitPhone(phoneField.digits, phoneField.iso, phoneField.pending)
  const title =
    phase === 'phone'
      ? copy(locale, 'phoneTitle')
      : phase === 'code'
        ? copy(locale, 'codeTitle')
        : phase === 'channel'
          ? copy(locale, 'channelTitle')
          : copy(locale, 'profileTitle')
  const subtitle =
    phase === 'phone'
      ? copy(locale, 'phoneSubtitle')
      : phase === 'code'
        ? copy(locale, 'codeSubtitle', { phone })
        : phase === 'channel'
          ? copy(locale, 'channelSubtitle')
          : copy(locale, 'profileSubtitle')

  return (
    <div className="moba-gate">
      <main className="moba-gate-main">
        <img className="moba-gate-icon" src="/onboarding-icon.png" alt="" width="56" height="56" />
        <h1 className="moba-gate-title">{title}</h1>
        {inviteSlug ? (
          <p className="moba-gate-sub">
            {invite?.missing
              ? 'Este convite não abre.'
              : invite?.open
                ? `Convite de ${invite.name}.`
                : invite?.reason === 'full'
                  ? `Os convites de ${invite?.name || 'esta pessoa'} acabaram.`
                  : invite
                    ? `O convite de ${invite.name} ainda não abre. Essa pessoa está aguardando convites.`
                    : 'Conferindo o convite.'}
          </p>
        ) : null}
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
            <button className="moba-gate-submit" type="submit" disabled={loading || !turnstileToken || !phoneReady}>
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
        ) : phase === 'channel' ? (
          <div className="moba-gate-form">
            <button className="moba-gate-submit" type="button" disabled={loading} onClick={openMoba}>
              {copy(locale, 'channelMoba')}
            </button>
            <button className="moba-gate-choice" type="button" disabled={loading} onClick={() => void chooseWhatsapp()}>
              {loading ? copy(locale, 'channelSending') : copy(locale, 'channelWhatsapp')}
            </button>
            <button className="moba-gate-choice" type="button" disabled>
              {copy(locale, 'channelImessage')}
              <span className="moba-gate-soon">{copy(locale, 'channelSoon')}</span>
            </button>
            {channelNote ? <p className="moba-gate-note">{channelNote}</p> : null}
            {error ? <p className="moba-gate-error">{error}</p> : null}
          </div>
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
