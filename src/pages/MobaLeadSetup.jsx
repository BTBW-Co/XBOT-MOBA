import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { completeLeadConnect, fetchLeadSetup, startLeadConnect } from '../api/moba'
import { storeVisitorIdentity } from '../lib/mobaVisitorIdentity'

const ICONS = {
  gmail: '/icons/gmail.svg',
  googledrive: '/icons/google-drive.svg',
  exist: '/icons/health.svg',
  github: '/icons/github.svg',
  googlecalendar: '/icons/google-calendar.svg',
  outlook: '/icons/outlook.svg',
}

export default function MobaLeadSetup({ token: tokenProp, onClose, compact = false }) {
  const params = useParams()
  const token = tokenProp || params.token
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fromWhatsapp = !onClose && searchParams.get('from') === 'whatsapp'
  const [view, setView] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchLeadSetup(token)
        if (cancelled) return
        setError('')
        setView(data)
        if (data?.session?.visitor_id) {
          storeVisitorIdentity(data.session, 'personal')
        }
        if (searchParams.get('done') === '1') {
          const toolkit = data?.toolkit || 'googlecalendar'
          const result = await completeLeadConnect(token, toolkit)
          if (cancelled) return
          if (result?.ok) setNotice(result.message || 'Conta ligada.')
          else setError(result?.message || 'A conta ainda não apareceu.')
          const fresh = await fetchLeadSetup(token).catch(() => data)
          if (!cancelled) setView(fresh)
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Link expirado')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, searchParams])

  async function connect(toolkit) {
    setBusy(toolkit)
    setError('')
    try {
      const data = await startLeadConnect(token, toolkit, {
        returnTo: fromWhatsapp ? 'whatsapp' : undefined,
      })
      if (data?.redirect_url) {
        window.location.assign(data.redirect_url)
        return
      }
      setError('Não consegui abrir a conexão.')
    } catch (err) {
      setError(err?.message || 'Não consegui abrir a conexão.')
    } finally {
      setBusy('')
    }
  }

  function goBack() {
    if (onClose) {
      onClose()
      return
    }
    if (fromWhatsapp) {
      window.location.assign(view?.whatsapp_url || 'whatsapp://')
      return
    }
    navigate('/')
  }

  return (
    <main className="moba-setup">
      <p className="moba-setup-kicker">Conta deste telefone</p>
      <h1>{view?.name ? `${view.name}, ligue ou troque a conta` : 'Ligue ou troque a conta'}</h1>
      <p className="moba-setup-lead">Estas contas ficam vinculadas a essa conta.</p>
      {error ? <p className="moba-setup-error">{error}</p> : null}
      {notice ? <p className="moba-setup-notice">{notice}</p> : null}
      <section className="moba-setup-section" aria-labelledby="moba-setup-heading">
        <h2 id="moba-setup-heading">Contas</h2>
        <div className="moba-setup-grid">
          {(view?.tools || []).map((tool) => {
            const linked = tool.status === 'connected'
            const label = tool.label
            const account = accountLine(tool)
            return (
              <button
                key={tool.toolkit}
                type="button"
                className={`moba-setup-card${tool.requested ? ' is-requested' : ''}${linked ? ' is-linked' : ''}`}
                disabled={busy === tool.toolkit}
                aria-label={linked ? `Trocar ${label}` : `Conectar ${label}`}
                onClick={() => connect(tool.toolkit)}
              >
                <span className="moba-setup-icon">
                  <img src={ICONS[tool.toolkit]} alt="" />
                </span>
                <span className="moba-setup-copy">
                  <strong>{label}</strong>
                  <span>{linked && account ? account : tool.description}</span>
                </span>
                <span className="moba-setup-action" aria-hidden="true">
                  {linked ? 'Trocar' : <PlusIcon />}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <button type="button" className="moba-setup-back" onClick={goBack}>
        {compact ? 'Fechar' : 'Voltar à conversa'}
      </button>
    </main>
  )
}

function accountLine(tool) {
  const account = String(tool?.account || '').trim()
  if (!account) return ''
  if (tool?.toolkit === 'googlecalendar' && !account.includes('@')) return ''
  return account
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

