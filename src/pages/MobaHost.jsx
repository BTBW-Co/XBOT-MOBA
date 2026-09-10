import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bootstrapMoba } from '../api/moba'
import { mountXChatFromBootstrap } from '../xchat/mountXChat'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function MobaHost({ notFound = false }) {
  const { objectId: rawObjectId } = useParams()
  const objectId = rawObjectId && UUID_RE.test(rawObjectId) ? rawObjectId : null
  const [state, setState] = useState({
    phase: notFound ? 'error' : 'loading',
    error: notFound ? 'Página não encontrada' : null,
    data: null,
  })

  useEffect(() => {
    if (notFound) return undefined
    if (rawObjectId && !objectId) {
      setState({ phase: 'error', error: 'Object ID inválido', data: null })
      return undefined
    }

    let cancelled = false

    ;(async () => {
      try {
        setState({ phase: 'loading', error: null, data: null })
        const data = await bootstrapMoba({ objectId })
        if (cancelled) return
        setState({ phase: 'ready', error: null, data })
        await mountXChatFromBootstrap(data)
      } catch (err) {
        if (cancelled) return
        setState({
          phase: 'error',
          error: err?.message || 'Não foi possível abrir o MOBA',
          data: null,
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [objectId, rawObjectId, notFound])

  const name = state.data?.display_name || 'XBot'
  const theme =
    state.data?.xchat?.widget?.theme_color ||
    state.data?.xchat?.widget?.themeColor ||
    '#1ee0a2'

  return (
    <div className="moba-shell" style={{ '--moba-accent': theme }}>
      <div className="moba-bg" aria-hidden />
      <header className="moba-header">
        <div className="moba-brand">
          <span className="moba-mark">MOBA</span>
          <span className="moba-product">XBot</span>
        </div>
        <p className="moba-tagline">Aproxime. Converse. Resolva.</p>
      </header>

      <main className="moba-main">
        {state.phase === 'loading' && (
          <div className="moba-card" role="status">
            <div className="moba-pulse" />
            <h1>Conectando…</h1>
            <p>Preparando sua conversa com {objectId ? 'este ponto' : 'o XBot'}.</p>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="moba-card moba-card--error">
            <h1>Não foi possível abrir</h1>
            <p>{state.error}</p>
            <a className="moba-link" href="https://xbotone.com">
              Conhecer o XBot →
            </a>
          </div>
        )}

        {state.phase === 'ready' && (
          <div className="moba-card moba-card--ready">
            <p className="moba-eyebrow">Você está falando com</p>
            <h1>{name}</h1>
            <p>
              {state.data?.has_pipeline
                ? 'Abra o chat no canto da tela para continuar.'
                : 'Este MOBA ainda está sendo configurado. Você pode conversar e começar o onboarding.'}
            </p>
          </div>
        )}
      </main>

      <footer className="moba-footer">
        <span>Powered by XBot</span>
      </footer>
    </div>
  )
}
