import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Route, Routes, useLocation } from 'react-router-dom'
import MobaHost from './pages/MobaHost'
import MobaLeadSetup from './pages/MobaLeadSetup'
import MobaPhoneHome from './pages/MobaPhoneHome'
import { setupTokenFromHref } from './lib/setupLink'

export default function App() {
  const location = useLocation()
  const [setupToken, setSetupToken] = useState(null)
  const [setupPopover, setSetupPopover] = useState(null)
  const onSetupPage = location.pathname.startsWith('/setup/')

  useEffect(() => {
    function onClick(event) {
      if (window.location.pathname.startsWith('/setup/')) return
      const anchor = event.target?.closest?.('a[href]')
      if (!anchor) return
      const token = setupTokenFromHref(anchor.href, window.location.hostname)
      if (!token) return
      event.preventDefault()
      event.stopPropagation()
      setSetupToken(token)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    if (onSetupPage) {
      setSetupToken(null)
      setSetupPopover(null)
    }
  }, [onSetupPage])

  useEffect(() => {
    function onToggle(event) {
      const token = String(event.detail?.token || '').trim()
      if (!token) {
        setSetupPopover(null)
        document.querySelectorAll('button.moba-operator-name').forEach((node) => {
          node.setAttribute('aria-expanded', 'false')
        })
        return
      }
      setSetupPopover({
        token,
        top: Number(event.detail?.top) || 72,
        right: Number(event.detail?.right) || 12,
        width: Number(event.detail?.width) || 420,
      })
    }
    window.addEventListener('moba-setup-toggle', onToggle)
    return () => window.removeEventListener('moba-setup-toggle', onToggle)
  }, [])

  useEffect(() => {
    if (!setupPopover) return undefined
    function close() {
      setSetupPopover(null)
      document.querySelectorAll('button.moba-operator-name').forEach((node) => {
        node.setAttribute('aria-expanded', 'false')
      })
    }
    function onPointer(event) {
      const target = event.target
      if (target?.closest?.('.moba-setup-popover, button.moba-operator-name')) return
      close()
    }
    function onKey(event) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [setupPopover])

  return (
    <>
      <Routes>
        <Route path="/" element={<MobaPhoneHome />} />
        <Route path="/invite/:slug" element={<MobaPhoneHome />} />
        <Route path="/setup/:token" element={<MobaLeadSetup />} />
        <Route path="/object-id/:objectId" element={<MobaHost />} />
        {/* Código curto canônico: https://moba.xbotone.com/K7X9QM2 */}
        <Route path="/:publicCode" element={<MobaHost />} />
        <Route path="*" element={<MobaHost notFound />} />
      </Routes>
      {setupToken && !onSetupPage
        ? createPortal(
            <div className="moba-setup-sheet" role="dialog" aria-modal="true" aria-label="Conectar conta">
              <MobaLeadSetup token={setupToken} onClose={() => setSetupToken(null)} />
            </div>,
            document.body,
          )
        : null}
      {setupPopover && !onSetupPage
        ? createPortal(
            <div
              className="moba-setup-popover"
              role="dialog"
              aria-label="Configurar contas"
              style={{ top: setupPopover.top, right: setupPopover.right, width: setupPopover.width }}
            >
              <MobaLeadSetup
                token={setupPopover.token}
                compact
                onClose={() => {
                  setSetupPopover(null)
                  document.querySelectorAll('button.moba-operator-name').forEach((node) => {
                    node.setAttribute('aria-expanded', 'false')
                  })
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
