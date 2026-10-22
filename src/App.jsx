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
    if (onSetupPage) setSetupToken(null)
  }, [onSetupPage])

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
    </>
  )
}
