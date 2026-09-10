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
  })

  useEffect(() => {
    if (notFound) return undefined
    if (rawObjectId && !objectId) {
      setState({ phase: 'error', error: 'Object ID inválido' })
      return undefined
    }

    let cancelled = false

    ;(async () => {
      try {
        setState({ phase: 'loading', error: null })
        const data = await bootstrapMoba({ objectId })
        if (cancelled) return
        setState({ phase: 'ready', error: null })
        await mountXChatFromBootstrap(data)
      } catch (err) {
        if (cancelled) return
        setState({
          phase: 'error',
          error: err?.message || 'Não foi possível abrir o MOBA',
        })
      }
    })()

    return () => {
      cancelled = true
      document.body.classList.remove('moba-xchat-live', 'moba-fullscreen')
    }
  }, [objectId, rawObjectId, notFound])

  if (state.phase === 'error') {
    return (
      <div className="moba-error">
        <h1>Não foi possível abrir</h1>
        <p>{state.error}</p>
        <a href="https://xbotone.com">Conhecer o XBot →</a>
      </div>
    )
  }

  return (
    <div className="moba-viewport" aria-busy={state.phase === 'loading'}>
      {state.phase === 'loading' ? (
        <div className="moba-boot" role="status">
          <div className="moba-boot-dot" />
          <p>Conectando…</p>
        </div>
      ) : null}
    </div>
  )
}
