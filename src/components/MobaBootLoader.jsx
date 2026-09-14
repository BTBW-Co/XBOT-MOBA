import { useEffect, useState } from 'react'

const CYCLE_MS = 2600

const BOTS = [
  {
    id: 'bb8',
    bg: '#FFE7D2',
    face: 'round',
    arms: (
      <>
        <path
          d="M96 190 q-40 -6 -46 -60"
          stroke="#0073EA"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="50" cy="126" r="13" fill="#0073EA" />
        <path
          d="M41 114 l-6 -10 M50 110 l0 -12 M59 114 l6 -10"
          stroke="#0073EA"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    id: 'obiwan',
    bg: '#DCEFF7',
    face: 'slots',
    behind: (
      <g stroke="#0073EA" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M164 28 h36 m0 0 l-9 -9 m9 9 l-9 9" />
        <path d="M200 52 h-36 m0 0 l9 -9 m-9 9 l9 9" />
      </g>
    ),
  },
  {
    id: 'threepio',
    bg: '#D8F1E6',
    face: 'happy',
    behind: (
      <g>
        <rect x="158" y="18" width="62" height="42" rx="19" fill="#FFFFFF" />
        <path d="M176 56 l-8 15 l19 -11 z" fill="#FFFFFF" />
        <circle cx="176" cy="39" r="5" fill="#F2705B" />
        <circle cx="190" cy="39" r="5" fill="#F2705B" />
        <circle cx="204" cy="39" r="5" fill="#F2705B" />
      </g>
    ),
  },
  {
    id: 'r2d2',
    bg: '#E3E7EE',
    face: 'wink',
    arms: (
      <>
        <path
          d="M160 188 q30 0 38 -18"
          stroke="#0073EA"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <g transform="translate(200,168) rotate(35)">
          <rect x="-6" y="-14" width="12" height="46" rx="6" fill="#8B95A7" />
          <path
            d="M0 -16 m-14 0 a14 14 0 1 1 28 0 a14 14 0 0 1 -3 8.6 l-8 -6.6 h-6 l-8 6.6 a14 14 0 0 1 -3 -8.6 z"
            fill="#8B95A7"
          />
        </g>
      </>
    ),
  },
]

function RoundFace() {
  return (
    <>
      <defs>
        <clipPath id="moba-boot-eye-l">
          <circle cx="106" cy="114" r="10" />
        </clipPath>
        <clipPath id="moba-boot-eye-r">
          <circle cx="150" cy="114" r="10" />
        </clipPath>
      </defs>
      <g className="moba-boot-eye" clipPath="url(#moba-boot-eye-l)">
        <circle cx="106" cy="114" r="10" fill="#FFE29D" />
        <circle className="moba-boot-pupil" cx="109" cy="111" r="3.2" fill="#22242C" />
      </g>
      <g className="moba-boot-eye" clipPath="url(#moba-boot-eye-r)">
        <circle cx="150" cy="114" r="10" fill="#FFE29D" />
        <circle className="moba-boot-pupil" cx="153" cy="111" r="3.2" fill="#22242C" />
      </g>
      <path d="M112 138 q16 14 32 0 v4 q-16 12 -32 0 z" fill="#FFE29D" />
    </>
  )
}

function SlotFace() {
  return (
    <>
      <g className="moba-boot-eyes">
        <rect className="moba-boot-eye" x="98" y="106" width="14" height="18" rx="7" fill="#FFE29D" />
        <rect className="moba-boot-eye" x="144" y="106" width="14" height="18" rx="7" fill="#FFE29D" />
      </g>
      <rect x="114" y="140" width="28" height="6" rx="3" fill="#FFE29D" />
    </>
  )
}

function HappyFace() {
  return (
    <g className="moba-boot-eyes">
      <path
        d="M96 116 q10 -14 20 0"
        stroke="#FFE29D"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M140 116 q10 -14 20 0"
        stroke="#FFE29D"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="128" cy="140" rx="12" ry="9" fill="#FFE29D" />
    </g>
  )
}

function WinkFace() {
  return (
    <>
      <defs>
        <clipPath id="moba-boot-eye-l">
          <circle cx="106" cy="114" r="10" />
        </clipPath>
      </defs>
      <g className="moba-boot-eye" clipPath="url(#moba-boot-eye-l)">
        <circle cx="106" cy="114" r="10" fill="#FFE29D" />
        <circle className="moba-boot-pupil" cx="109" cy="111" r="3.2" fill="#22242C" />
      </g>
      <rect className="moba-boot-eye" x="140" y="110" width="22" height="7" rx="3.5" fill="#FFE29D" />
      <path d="M112 140 h30 v6 h-30 z" fill="#FFE29D" />
    </>
  )
}

function Face({ type }) {
  if (type === 'slots') return <SlotFace />
  if (type === 'happy') return <HappyFace />
  if (type === 'wink') return <WinkFace />
  return <RoundFace />
}

function WorkforceSticker({ bot }) {
  return (
    <svg
      className="moba-boot-sticker"
      viewBox="0 0 256 256"
      width="160"
      height="160"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="128" cy="128" r="124" fill={bot.bg} />
      <ellipse cx="128" cy="216" rx="58" ry="10" fill="#000000" opacity="0.08" />
      <rect x="96" y="176" width="64" height="34" rx="16" fill="#F2705B" />
      <rect x="96" y="196" width="64" height="14" rx="7" fill="#D9553F" opacity="0.55" />
      {bot.arms}
      {bot.behind}
      <rect x="34" y="96" width="28" height="50" rx="14" fill="#FFD966" />
      <rect x="194" y="96" width="28" height="50" rx="14" fill="#FFD966" />
      <rect x="42" y="104" width="6" height="34" rx="3" fill="#EDBE3F" />
      <rect x="208" y="104" width="6" height="34" rx="3" fill="#EDBE3F" />
      <rect x="112" y="44" width="32" height="22" rx="10" fill="#0073EA" />
      <rect x="54" y="60" width="148" height="122" rx="36" fill="#F2705B" />
      <path
        d="M54 152 v-6 h148 v6 a36 36 0 0 1 -36 30 h-76 a36 36 0 0 1 -36 -30 z"
        fill="#D9553F"
        opacity="0.55"
      />
      <rect x="70" y="76" width="116" height="90" rx="26" fill="#22242C" />
      <Face type={bot.face} />
    </svg>
  )
}

export default function MobaBootLoader() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return undefined
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % BOTS.length)
    }, CYCLE_MS)
    return () => window.clearInterval(id)
  }, [])

  const bot = BOTS[index]

  return (
    <div className="moba-boot" role="status">
      <div className="moba-boot-stage">
        <svg
          className="moba-boot-ring"
          viewBox="0 0 180 180"
          width="180"
          height="180"
          aria-hidden="true"
          focusable="false"
        >
          <circle className="moba-boot-ring-a" cx="90" cy="90" r="84" />
          <circle className="moba-boot-ring-b" cx="90" cy="90" r="72" />
        </svg>
        <div className="moba-boot-figure">
          <WorkforceSticker key={bot.id} bot={bot} />
        </div>
      </div>
      <p>Conectando…</p>
    </div>
  )
}
