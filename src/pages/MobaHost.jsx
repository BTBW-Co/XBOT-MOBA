import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bootstrapMoba, unlockMoba } from '../api/moba'
import { mountXChatFromBootstrap } from '../xchat/mountXChat'
import MobaBootLoader from '../components/MobaBootLoader'
import MobaErrorScreen from './MobaErrorScreen'
import MobaPinScreen from './MobaPinScreen'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function pinStorageKey(objectId) {
  return `moba.pin.${objectId || 'default'}`
}

function readStoredPin(objectId) {
  try {
    return (sessionStorage.getItem(pinStorageKey(objectId)) || '').trim()
  } catch {
    return ''
  }
}

function writeStoredPin(objectId, pin) {
  try {
    sessionStorage.setItem(pinStorageKey(objectId), pin)
  } catch {
    /* ignore */
  }
}

function isBootPreview() {
  if (!import.meta.env.DEV) return false
  try {
    return new URLSearchParams(window.location.search).get('preview') === 'boot'
  } catch {
    return false
  }
}

export default function MobaHost({ notFound = false }) {
  const { objectId: rawObjectId } = useParams()
  const objectId = rawObjectId && UUID_RE.test(rawObjectId) ? rawObjectId : null
  const unlockingRef = useRef(false)

  const [state, setState] = useState({
    phase: notFound ? 'error' : 'loading',
    error: notFound ? 'Página não encontrada' : null,
    preview: null,
    pinError: null,
    unlocking: false,
  })

  useEffect(() => {
    if (notFound) return undefined
    if (isBootPreview()) return undefined
    if (rawObjectId && !objectId) {
      setState({
        phase: 'error',
        error: 'Object ID inválido',
        preview: null,
        pinError: null,
        unlocking: false,
      })
      return undefined
    }

    let cancelled = false

    ;(async () => {
      try {
        setState((prev) => ({ ...prev, phase: 'loading', error: null, pinError: null }))
        const storedPin = readStoredPin(objectId)
        let data
        if (storedPin) {
          try {
            data = await unlockMoba({ objectId, pin: storedPin })
          } catch {
            data = await bootstrapMoba({ objectId })
          }
        } else {
          data = await bootstrapMoba({ objectId })
        }
        if (cancelled) return
        if (data?.pin_required) {
          setState({
            phase: 'pin',
            error: null,
            preview: data,
            pinError: storedPin ? 'PIN inválido. Tente de novo.' : null,
            unlocking: false,
          })
          return
        }
        setState({ phase: 'ready', error: null, preview: null, pinError: null, unlocking: false })
        await mountXChatFromBootstrap(data)
      } catch (err) {
        if (cancelled) return
        setState({
          phase: 'error',
          error: err?.message || 'Não foi possível abrir o MOBA',
          preview: null,
          pinError: null,
          unlocking: false,
        })
      }
    })()

    return () => {
      cancelled = true
      document.body.classList.remove('moba-xchat-live', 'moba-fullscreen')
    }
  }, [objectId, rawObjectId, notFound])

  async function handleUnlock(pin) {
    if (unlockingRef.current) return
    unlockingRef.current = true
    setState((prev) => ({ ...prev, unlocking: true, pinError: null }))
    try {
      const data = await unlockMoba({ objectId, pin })
      if (data?.pin_required) {
        unlockingRef.current = false
        setState((prev) => ({
          ...prev,
          unlocking: false,
          pinError: 'PIN inválido. Tente de novo.',
        }))
        return
      }
      writeStoredPin(objectId, pin)
      setState({ phase: 'ready', error: null, preview: null, pinError: null, unlocking: false })
      await mountXChatFromBootstrap(data)
    } catch (err) {
      const invalid = err?.status === 403
      unlockingRef.current = false
      setState((prev) => ({
        ...prev,
        unlocking: false,
        pinError: invalid ? 'PIN inválido. Tente de novo.' : 'Não foi possível validar o PIN.',
      }))
    }
  }

  if (state.phase === 'error') {
    return <MobaErrorScreen error={state.error} notFound={notFound} />
  }

  if (state.phase === 'pin') {
    return (
      <MobaPinScreen
        displayName={state.preview?.display_name}
        headline={state.preview?.experience?.headline}
        error={state.pinError}
        submitting={state.unlocking}
        onSubmit={handleUnlock}
      />
    )
  }

  return (
    <div className="moba-viewport" aria-busy={state.phase === 'loading'}>
      {state.phase === 'loading' ? <MobaBootLoader /> : null}
    </div>
  )
}
