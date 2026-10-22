import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { completeLeadConnect, fetchLeadSetup, startLeadConnect } from '../api/moba'
import { storeVisitorIdentity } from '../lib/mobaVisitorIdentity'

const COPY = {
  googlecalendar: 'Agenda',
  gmail: 'E-mail',
}

export default function MobaLeadSetup({ token: tokenProp, onClose }) {
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
        setView(data)
        if (data?.session?.visitor_id && data.session.expires_in) {
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
      <h1>{view?.name ? `${view.name}, ligue a conta` : 'Ligue a conta'}</h1>
      <p className="moba-setup-lead">
        E-mail e agenda ficam nesta pessoa. Não entram na workspace.
      </p>
      {error ? <p className="moba-setup-error">{error}</p> : null}
      {notice ? <p className="moba-setup-notice">{notice}</p> : null}
      <ul className="moba-setup-list">
        {(view?.tools || []).map((tool) => {
          const linked = tool.status === 'connected'
          return (
            <li key={tool.toolkit} className={tool.requested ? 'is-requested' : ''}>
              <div>
                <strong>{COPY[tool.toolkit] || tool.label}</strong>
                <span>{linked ? tool.account || 'Conectada' : 'Ainda não ligada'}</span>
              </div>
              <button
                type="button"
                disabled={linked || busy === tool.toolkit}
                onClick={() => connect(tool.toolkit)}
              >
                {linked ? 'Conectada' : busy === tool.toolkit ? 'Abrindo…' : 'Conectar'}
              </button>
            </li>
          )
        })}
      </ul>
      <button type="button" className="moba-setup-back" onClick={goBack}>
        Voltar à conversa
      </button>
    </main>
  )
}
