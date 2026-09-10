import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { bootstrapMoba } from '../api/moba'
import { mountXChatFromBootstrap } from '../xchat/mountXChat'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const DEFAULT_ROBOT = 'https://app.xbotone.com/workforce/bb8.svg'

export default function MobaHost({ notFound = false }) {
  const { objectId: rawObjectId } = useParams()
  const [searchParams] = useSearchParams()
  const objectId = rawObjectId && UUID_RE.test(rawObjectId) ? rawObjectId : null
  const forcedMode = (searchParams.get('mode') || '').toLowerCase()

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
      document.body.classList.remove('moba-xchat-live')
    }
  }, [objectId, rawObjectId, notFound])

  const experience = state.data?.experience || {}
  const isTotem =
    forcedMode === 'totem' ||
    experience.mode === 'totem' ||
    experience.form_factor === 'totem'

  const name = state.data?.display_name || 'XBot'
  const headline = experience.headline || name
  const tapCta = experience.tap_cta || (isTotem ? 'Tap to talk to XBot' : 'APROXIME.')
  const tagline = experience.tagline || 'APROXIME. CONVERSE. RESOLVA.'
  const robotUrl = experience.robot_icon_url || DEFAULT_ROBOT
  const contextLabel = state.data?.moba_context?.label
  const contextType = state.data?.moba_context?.type
  const theme =
    state.data?.xchat?.widget?.theme_color ||
    state.data?.xchat?.widget?.themeColor ||
    '#1ee0a2'

  const shellClass = useMemo(
    () => ['moba-shell', isTotem ? 'moba-shell--totem' : 'moba-shell--hosted'].join(' '),
    [isTotem]
  )

  return (
    <div className={shellClass} style={{ '--moba-accent': theme }}>
      <div className="moba-bg" aria-hidden />
      <header className="moba-header">
        <div className="moba-brand">
          <img className="moba-robot" src={robotUrl} alt="" width={40} height={40} />
          <div>
            <div className="moba-brand-row">
              <span className="moba-mark">MOBA</span>
              <span className="moba-product">XBot</span>
            </div>
            <p className="moba-tagline">{tagline}</p>
          </div>
        </div>
      </header>

      <main className="moba-main">
        {state.phase === 'loading' && (
          <div className="moba-card" role="status">
            <img className="moba-robot moba-robot--lg" src={robotUrl} alt="" />
            <p className="moba-cta">{tapCta}</p>
            <div className="moba-pulse" />
            <p>Conectando…</p>
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
          <div className={`moba-card moba-card--ready ${isTotem ? 'moba-card--totem' : ''}`}>
            <img className="moba-robot moba-robot--lg" src={robotUrl} alt="XBot" />
            <p className="moba-cta">{tapCta}</p>
            <h1>{headline}</h1>
            {(contextLabel || contextType) && (
              <p className="moba-context">
                {contextType ? <span className="moba-pill">{contextType}</span> : null}
                {contextLabel || null}
              </p>
            )}
            <p className="moba-hint">
              {state.data?.has_pipeline
                ? 'Converse no chat — o Agent entende este ponto e pode agir.'
                : 'Este ponto ainda está sendo configurado. Você já pode conversar.'}
            </p>
          </div>
        )}
      </main>

      <footer className="moba-footer">
        <span>XBOT · MOBA</span>
        <span>From the physical world to your business intelligence.</span>
      </footer>
    </div>
  )
}
