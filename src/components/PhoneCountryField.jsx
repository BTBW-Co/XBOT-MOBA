import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { caretForDigitCount, listCountries, readPhoneField, resolvePhone, splitPhoneInput } from '../lib/phoneInput'

export default function PhoneCountryField({
  locale,
  digits,
  iso,
  onChange,
  searchLabel,
  emptyLabel,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const searchRef = useRef(null)
  const caretDigits = useRef(null)
  const [draft, setDraft] = useState('')
  const countries = useMemo(() => listCountries(locale), [locale])
  const selected = countries.find((country) => country.iso === iso) || countries.find((country) => country.iso === 'BR')
  const display = draft || resolvePhone(digits, iso).display
  const needle = query.trim().toLowerCase().replace(/^\+/, '')
  const visible = countries.filter((country) => {
    if (!needle) return true
    return (
      country.name.toLowerCase().includes(needle) ||
      country.code.startsWith(needle) ||
      country.iso.toLowerCase().includes(needle)
    )
  })

  useLayoutEffect(() => {
    const count = caretDigits.current
    const node = inputRef.current
    if (count == null || !node) return
    const pos = caretForDigitCount(node.value, count)
    node.setSelectionRange(pos, pos)
    caretDigits.current = null
  }, [digits, iso, display])

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    searchRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function emit(nextDigits, nextIso, pending) {
    onChange({ digits: nextDigits, iso: nextIso, pending: Boolean(pending) })
  }

  function onType(event) {
    const raw = event.target.value
    const caret = event.target.selectionStart ?? raw.length
    caretDigits.current = raw.slice(0, caret).replace(/\D/g, '').length
    const next = readPhoneField(raw, iso)
    setDraft(next.pending ? next.display : '')
    emit(next.digits, next.iso, next.pending)
  }

  function choose(country) {
    caretDigits.current = null
    const split = draft ? splitPhoneInput(draft) : null
    const national = split?.separated ? split.national : resolvePhone(digits, iso).national
    setDraft('')
    emit(`${country.code}${national}`.replace(/\D/g, '').slice(0, 15), country.iso, false)
    setOpen(false)
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className={`moba-phone${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="moba-phone-flag"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selected ? `${selected.name} +${selected.code}` : iso}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="moba-phone-emoji" aria-hidden="true">
          {selected?.flag || '🏳️'}
        </span>
        <svg className="moba-phone-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.2 4.2 6 8l3.8-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="moba-phone-sep" aria-hidden="true" />
      <input
        ref={inputRef}
        id="moba-national"
        className="moba-phone-input"
        inputMode="tel"
        autoComplete="tel"
        autoFocus={autoFocus}
        value={display}
        aria-label={selected?.name || iso}
        onChange={onType}
      />
      {open ? (
        <div className="moba-phone-menu">
          <label className="moba-phone-search">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              placeholder={searchLabel}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <ul className="moba-phone-list" role="listbox">
            {visible.length === 0 ? <li className="moba-phone-empty">{emptyLabel}</li> : null}
            {visible.map((country) => (
              <li key={country.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={country.iso === iso}
                  className="moba-phone-option"
                  onClick={() => choose(country)}
                >
                  <span className="moba-phone-emoji" aria-hidden="true">
                    {country.flag}
                  </span>
                  <span className="moba-phone-name">{country.name}</span>
                  <span className="moba-phone-code">+{country.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
