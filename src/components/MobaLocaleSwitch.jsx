import { VISITOR_LOCALES, normalizeVisitorLocale, tLocale, writeExplicitLocale } from '../lib/visitorLocale'

export default function MobaLocaleSwitch({ locale, className = '' }) {
  const code = normalizeVisitorLocale(locale) || 'pt'

  function onChange(event) {
    const next = normalizeVisitorLocale(event.target.value)
    if (!next || next === code) return
    writeExplicitLocale(next)
    window.location.reload()
  }

  return (
    <label className={`moba-locale ${className}`.trim()}>
      <span className="sr-only">{tLocale(code, 'langLabel')}</span>
      <select value={code} onChange={onChange} aria-label={tLocale(code, 'langLabel')}>
        {VISITOR_LOCALES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
