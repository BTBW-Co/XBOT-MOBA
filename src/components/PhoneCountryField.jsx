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
  const selected = countries.find((country) => country.iso === iso) || null
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
    const node = inputRef.current
    if (!node) return undefined
    function clampCaret() {
      if (document.activeElement !== node) return
      const start = node.selectionStart ?? 0
      const end = node.selectionEnd ?? 0
      if (start >= 1) return
      node.setSelectionRange(1, Math.max(end, 1))
    }
    document.addEventListener('selectionchange', clampCaret)
    return () => document.removeEventListener('selectionchange', clampCaret)
  }, [])

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

  function applyRaw(raw, caret) {
    const text = `+${String(raw ?? '').replace(/\+/g, '')}`
    const pos = Math.max(caret ?? text.length, 1)
    caretDigits.current = text.slice(0, pos).replace(/\D/g, '').length
    const next = readPhoneField(text, iso)
    setDraft(next.pending ? next.display : '')
    emit(next.digits, next.iso, next.pending)
  }

  function onType(event) {
    const original = String(event.target.value)
    let caret = event.target.selectionStart ?? original.length
    if (!original.startsWith('+')) caret += 1
    applyRaw(original, caret)
  }

  function onKeyDown(event) {
    const node = event.currentTarget
    const start = node.selectionStart ?? 0
    const end = node.selectionEnd ?? 0
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault()
      node.setSelectionRange(1, node.value.length)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      node.setSelectionRange(1, event.shiftKey ? Math.max(end, 1) : 1)
      return
    }
    if (event.key === 'ArrowLeft' && start <= 1) {
      event.preventDefault()
      return
    }
    if (event.key === 'Backspace' && start === end && start <= 1) {
      event.preventDefault()
      return
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && start < 1 && end > 1) {
      event.preventDefault()
      applyRaw(node.value.slice(end), 1)
    }
  }

  function onBeforeInput(event) {
    if (event.inputType !== 'deleteContentBackward') return
    const node = event.currentTarget
    const start = node.selectionStart ?? 0
    const end = node.selectionEnd ?? 0
    if (start === end && start <= 1) event.preventDefault()
  }

  function onSelect(event) {
    const node = event.currentTarget
    const start = node.selectionStart ?? 0
    const end = node.selectionEnd ?? 0
    if (start >= 1) return
    node.setSelectionRange(1, Math.max(end, 1))
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
        aria-label={selected ? `${selected.name} +${selected.code}` : '+'}
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
        aria-label={selected?.name || '+'}
        onChange={onType}
        onKeyDown={onKeyDown}
        onBeforeInput={onBeforeInput}
        onSelect={onSelect}
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
