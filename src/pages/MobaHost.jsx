import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { bootstrapMoba, unlockMoba } from '../api/moba'
import {
  applyMobaBackground,
  readCachedMobaAppearance,
  writeCachedMobaAppearance,
} from '../lib/mobaBackground'
import { mountXChatFromBootstrap } from '../xchat/mountXChat'
import MobaBootLoader from '../components/MobaBootLoader'
import MobaErrorScreen from './MobaErrorScreen'
import MobaPinScreen from './MobaPinScreen'

/** Pinta fundo + cache a partir do widget do bootstrap (se houver). */
function paintBackgroundFromBootstrap(data, ref) {
  const widget = data?.xchat?.widget
  if (!widget) return
  applyMobaBackground(widget)
  writeCachedMobaAppearance(data?.public_code || ref || data?.object_id, widget)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Paths reservados do host (não são public_code). */
const RESERVED_PATHS = new Set([
  'object-id',
  'share',
  'assets',
  'static',
  'favicon.ico',
  'robots.txt',
  'index.html',
  'manifest.json',
  'manifest.webmanifest',
  'sw.js',
  'service-worker.js',
  'vite.svg',
  'health',
  'api',
])

const PUBLIC_CODE_RE = /^[0-9A-Za-z]{4,12}$/

function pinStorageKey(ref) {
  return `moba.pin.${ref || 'default'}`
}

function readStoredPin(ref) {
  try {
    return (sessionStorage.getItem(pinStorageKey(ref)) || '').trim()
  } catch {
    return ''
  }
}

function writeStoredPin(ref, pin) {
  try {
    sessionStorage.setItem(pinStorageKey(ref), pin)
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

/**
 * Resolve o identificador público do MOBA a partir da rota.
 * Aceita UUID (legado /object-id/…) ou public_code curto (/K7X9QM2).
 */
function resolveMobaRef({ objectId: rawObjectId, publicCode: rawPublicCode }) {
  const fromObject = (rawObjectId || '').trim()
  if (fromObject && UUID_RE.test(fromObject)) {
    return { ref: fromObject, kind: 'uuid' }
  }
  const fromCode = (rawPublicCode || '').trim()
  if (!fromCode) return { ref: null, kind: null }
  if (RESERVED_PATHS.has(fromCode.toLowerCase())) {
    return { ref: null, kind: 'invalid' }
  }
  if (UUID_RE.test(fromCode)) {
    return { ref: fromCode, kind: 'uuid' }
  }
  if (PUBLIC_CODE_RE.test(fromCode)) {
    return { ref: fromCode, kind: 'code' }
  }
  return { ref: null, kind: 'invalid' }
}

export default function MobaHost({ notFound = false }) {
  const { objectId: rawObjectId, publicCode: rawPublicCode } = useParams()
  const { ref: mobaRef, kind } = resolveMobaRef({
    objectId: rawObjectId,
    publicCode: rawPublicCode,
  })
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
    if ((rawObjectId || rawPublicCode) && !mobaRef) {
      setState({
        phase: 'error',
        error: kind === 'invalid' ? 'Link inválido' : 'Object ID inválido',
        preview: null,
        pinError: null,
        unlocking: false,
      })
      return undefined
    }

    // 2ª visita na mesma aba: pinta o fundo cacheado antes do bootstrap.
    const cached = readCachedMobaAppearance(mobaRef)
    if (cached) applyMobaBackground(cached)

    let cancelled = false

    ;(async () => {
      try {
        setState((prev) => ({ ...prev, phase: 'loading', error: null, pinError: null }))
        const storedPin = readStoredPin(mobaRef)
        let data
        if (storedPin) {
          try {
            data = await unlockMoba({ objectId: mobaRef, pin: storedPin })
          } catch {
            data = await bootstrapMoba({ objectId: mobaRef })
          }
        } else {
          data = await bootstrapMoba({ objectId: mobaRef })
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
        // Assim que o JSON chega: fundo + preload; o loader permanece até o XChat montar.
        paintBackgroundFromBootstrap(data, mobaRef)
        await mountXChatFromBootstrap(data)
        if (cancelled) return
        setState({ phase: 'ready', error: null, preview: null, pinError: null, unlocking: false })
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
      document.body.classList.remove('moba-xchat-live', 'moba-fullscreen', 'moba-has-bg')
      document.documentElement.style.removeProperty('--moba-bg-image')
      document.documentElement.style.removeProperty('--moba-bg-opacity')
    }
  }, [mobaRef, rawObjectId, rawPublicCode, kind, notFound])

  async function handleUnlock(pin) {
    if (unlockingRef.current) return
    unlockingRef.current = true
    setState((prev) => ({ ...prev, unlocking: true, pinError: null }))
    try {
      const data = await unlockMoba({ objectId: mobaRef, pin })
      if (data?.pin_required) {
        unlockingRef.current = false
        setState((prev) => ({
          ...prev,
          unlocking: false,
          pinError: 'PIN inválido. Tente de novo.',
        }))
        return
      }
      writeStoredPin(mobaRef, pin)
      paintBackgroundFromBootstrap(data, mobaRef)
      setState({ phase: 'loading', error: null, preview: null, pinError: null, unlocking: false })
      await mountXChatFromBootstrap(data)
      unlockingRef.current = false
      setState({ phase: 'ready', error: null, preview: null, pinError: null, unlocking: false })
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
