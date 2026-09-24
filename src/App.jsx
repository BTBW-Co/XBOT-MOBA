import { Route, Routes } from 'react-router-dom'
import MobaHost from './pages/MobaHost'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MobaHost />} />
      <Route path="/object-id/:objectId" element={<MobaHost />} />
      {/* Código curto canônico: https://moba.xbotone.com/K7X9QM2 */}
      <Route path="/:publicCode" element={<MobaHost />} />
      <Route path="*" element={<MobaHost notFound />} />
    </Routes>
  )
}
