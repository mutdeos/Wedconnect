import { useCallback, useEffect, useRef, useState } from 'react'
import { markIntroSeen } from './introStorage'
import './Intro.css'

// ---------- scroll timeline helpers ----------
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
// rises over [a,b], holds, falls over [c,d]
const hold = (p, a, b, c, d) => Math.min(seg(p, a, b), 1 - seg(p, c, d))

// Every animated value is derived from one number: overall scroll progress p (0 → 1).
function timeline(p) {
  const zoom = ease(seg(p, 0.16, 0.38))
  return {
    progress: p,
    hint: 1 - seg(p, 0, 0.04),
    door: ease(seg(p, 0.03, 0.22)),
    birds: seg(p, 0.05, 0.42),
    zoom,
    flash: Math.sin(Math.PI * zoom) * 0.8,
    venue: seg(p, 0.2, 0.66),
    caption: hold(p, 0.36, 0.42, 0.53, 0.59),
    petals: hold(p, 0.2, 0.28, 0.9, 0.98),
    veil: ease(seg(p, 0.58, 0.68)),
    rings: ease(seg(p, 0.62, 0.75)),
    heart: ease(seg(p, 0.74, 0.83)),
    w1: ease(seg(p, 0.76, 0.81)),
    w2: ease(seg(p, 0.81, 0.86)),
    brand: ease(seg(p, 0.86, 0.9)),
    cta: ease(seg(p, 0.9, 0.95)),
  }
}

// deterministic pseudo-random so the scene looks the same on every render
const rand = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const FLOWER_COLORS = ['#f7c6d2', '#ffffff', '#ee8fa8', '#fbe3c6', '#d9677f']

// ---------- scene geometry (1600×900 viewBox shared by all venue layers) ----------
const BALUSTERS = Array.from({ length: 62 }, (_, i) => i * 26 + 4)

const CHAIRS = [0, 1, 2, 3].flatMap((row) => {
  const y = 700 + row * 44 + row * row * 6
  const s = 0.6 + row * 0.22
  const aisleHalf = 34 + (y - 668) * (160 / 232)
  return [-1, 1].flatMap((side) =>
    [0, 1, 2, 3].map((c) => ({
      key: `${row}-${side}-${c}`,
      x: 800 + side * (aisleHalf + 16 * s + c * 34 * s),
      y,
      s,
      bow: c === 0,
    })),
  )
})

const ARCH_FLOWERS = [
  ...Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI - (i * Math.PI) / 12
    return { x: 800 + 90 * Math.cos(a), y: 500 - 90 * Math.sin(a), r: 8 }
  }),
  ...[520, 560, 600, 640].flatMap((y) => [
    { x: 710, y, r: 7 + (y - 500) / 40 },
    { x: 890, y, r: 7 + (y - 500) / 40 },
  ]),
]

const BULBS = Array.from({ length: 27 }, (_, i) => {
  const t = i / 26
  // quadratic curve (150,330) → control (800,430) → (1450,330)
  const x = (1 - t) ** 2 * 150 + 2 * (1 - t) * t * 800 + t * t * 1450
  const y = (1 - t) ** 2 * 330 + 2 * (1 - t) * t * 430 + t * t * 330
  return { x, y, d: rand(i + 7) * 2 }
})

const BUSHES = Array.from({ length: 22 }, (_, i) => {
  const left = i < 11
  const k = left ? i : i - 11
  return {
    x: left ? 20 + k * 62 : 940 + k * 62,
    y: 648 + rand(i + 3) * 10,
    r: 22 + rand(i + 9) * 10,
    flower: FLOWER_COLORS[i % FLOWER_COLORS.length],
  }
})

const PALM_FRONDS = [-172, -145, -118, -85, -50, -20, 12, 38]

const BIRDS = Array.from({ length: 9 }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1
  return {
    dx: `${side * (40 + rand(i) * 40)}vw`,
    dy: `${-(25 + rand(i + 20) * 50)}vh`,
    s: 1 + rand(i + 40) * 1.6,
    flap: `${0.32 + rand(i + 60) * 0.25}s`,
    lag: rand(i + 80) * 0.25,
  }
})

const PETALS = Array.from({ length: 26 }, (_, i) => ({
  left: `${rand(i + 100) * 100}%`,
  size: `${8 + rand(i + 130) * 10}px`,
  dur: `${7 + rand(i + 160) * 7}s`,
  delay: `${-rand(i + 190) * 14}s`,
  sway: `${(rand(i + 220) - 0.5) * 160}px`,
  hue: rand(i + 250) > 0.5 ? '#f7c6d2' : '#fff3f5',
}))

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2
  return { x: `${Math.cos(a) * 190}px`, y: `${Math.sin(a) * 170}px`, d: `${rand(i + 300) * 0.4}s` }
})

// ---------- small pieces ----------
function Bird({ className = '', style }) {
  return (
    <svg viewBox="0 0 60 40" className={`bird ${className}`} style={style} aria-hidden="true">
      <path className="wing wing-l" d="M30 20 C 22 6, 10 2, 0 5 C 10 10, 18 18, 30 23 Z" />
      <path className="wing wing-r" d="M30 20 C 38 6, 50 2, 60 5 C 50 10, 42 18, 30 23 Z" />
      <ellipse cx="30" cy="22" rx="5.5" ry="3.4" />
      <path d="M30 24 L26.5 32 L30 29.5 L33.5 32 Z" />
    </svg>
  )
}

function FlowerCluster({ x, y, r, i }) {
  return (
    <g>
      <ellipse cx={x - r * 0.9} cy={y + r * 0.4} rx={r * 0.9} ry={r * 0.45} fill="#4f7d4a" />
      <circle cx={x - r * 0.5} cy={y} r={r} fill={FLOWER_COLORS[i % 5]} />
      <circle cx={x + r * 0.55} cy={y - r * 0.45} r={r * 0.85} fill={FLOWER_COLORS[(i + 1) % 5]} />
      <circle cx={x + r * 0.2} cy={y + r * 0.6} r={r * 0.75} fill={FLOWER_COLORS[(i + 2) % 5]} />
    </g>
  )
}

function Palm({ mirror }) {
  return (
    <g transform={mirror ? 'translate(1600 0) scale(-1 1)' : undefined}>
      <path d="M120 910 C 150 760, 110 560, 190 380" stroke="#3d2c2a" strokeWidth="20" fill="none" strokeLinecap="round" />
      {PALM_FRONDS.map((a) => (
        <path
          key={a}
          d="M0 0 C 50 -42, 135 -40, 200 12 C 125 -8, 60 -6, 0 0 Z"
          transform={`translate(190 380) rotate(${a})`}
          fill="#2c4631"
        />
      ))}
    </g>
  )
}

function Backdrop() {
  return (
    <svg className="layer layer-backdrop" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35295a" />
          <stop offset="0.35" stopColor="#8e5a8f" />
          <stop offset="0.62" stopColor="#e2928f" />
          <stop offset="0.8" stopColor="#f8c79a" />
          <stop offset="1" stopColor="#ffe3b3" />
        </linearGradient>
        <linearGradient id="wc-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0a992" />
          <stop offset="0.25" stopColor="#9b88b0" />
          <stop offset="1" stopColor="#34457c" />
        </linearGradient>
        <radialGradient id="wc-sunglow">
          <stop offset="0" stopColor="#fff4d8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffd39a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffb38a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="wc-above-sea">
          <rect x="0" y="0" width="1600" height="470" />
        </clipPath>
      </defs>
      <rect width="1600" height="470" fill="url(#wc-sky)" />
      <g className="sun" clipPath="url(#wc-above-sea)">
        <circle cx="800" cy="450" r="260" fill="url(#wc-sunglow)" />
        <circle cx="800" cy="455" r="58" fill="#fff1d2" />
      </g>
      <rect y="470" width="1600" height="430" fill="url(#wc-sea)" />
      <path d="M0 471 C 120 432, 230 440, 330 462 C 390 450, 450 456, 520 471 Z" fill="#8a6c93" opacity="0.8" />
      <path d="M1180 471 C 1260 446, 1350 438, 1440 455 C 1500 446, 1560 450, 1600 460 V471 Z" fill="#7f6490" opacity="0.8" />
      {Array.from({ length: 8 }, (_, i) => {
        const w = 36 + i * 16
        return (
          <rect
            key={i}
            className="shimmer"
            style={{ animationDelay: `${i * 0.27}s` }}
            x={800 - w / 2}
            y={478 + i * 14}
            width={w}
            height="3"
            rx="1.5"
            fill="#ffe6c2"
          />
        )
      })}
      <g className="sailboat">
        <path d="M1090 468 L1150 468 L1140 476 L1100 476 Z" fill="#4b3f63" />
        <path d="M1120 466 L1120 418 L1146 466 Z" fill="#fff6ec" />
        <path d="M1117 466 L1117 428 L1098 466 Z" fill="#f6dfd6" />
      </g>
    </svg>
  )
}

function Terrace() {
  return (
    <svg className="layer layer-terrace" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wc-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ea266" />
          <stop offset="1" stopColor="#3e6a40" />
        </linearGradient>
      </defs>

      {/* string lights */}
      <path d="M150 330 Q 800 430 1450 330" stroke="#3a2c2c" strokeWidth="1.5" fill="none" opacity="0.6" />
      {BULBS.map((b, i) => (
        <circle key={i} className="bulb" style={{ animationDelay: `${b.d}s` }} cx={b.x} cy={b.y + 5} r="4.5" fill="#ffe7a8" />
      ))}

      {/* balustrade at the cliff edge */}
      <rect x="0" y="588" width="1600" height="11" fill="#fbf3ea" />
      {BALUSTERS.map((x) => (
        <path key={x} d={`M${x + 4} 599 h10 c -5 8, -5 12, 0 17 c 3 6, 3 12, 0 18 h-10 c -3 -6, -3 -12, 0 -18 c 5 -5, 5 -9, 0 -17 Z`} fill="#f3e6d6" />
      ))}
      <rect x="0" y="634" width="1600" height="9" fill="#efdfcc" />

      {/* lawn and hedges */}
      <rect x="0" y="643" width="1600" height="257" fill="url(#wc-lawn)" />
      {BUSHES.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={i % 2 ? '#4a7a45' : '#56874d'} />
          <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.4} r="5" fill={b.flower} />
          <circle cx={b.x + b.r * 0.3} cy={b.y - b.r * 0.1} r="4" fill={b.flower} />
        </g>
      ))}

      {/* aisle with petals */}
      <path d="M766 668 L834 668 L994 900 L606 900 Z" fill="#fbf4ec" />
      {Array.from({ length: 40 }, (_, i) => {
        const t = rand(i + 400)
        const y = 672 + t * 228
        const half = 34 + (y - 668) * (160 / 232)
        return (
          <ellipse
            key={i}
            cx={800 + (rand(i + 450) - 0.5) * 2 * half * 0.9}
            cy={y}
            rx={2 + t * 4}
            ry={1.2 + t * 2}
            fill={i % 3 ? '#f2a7ba' : '#e1718e'}
            opacity="0.85"
          />
        )
      })}

      {/* floral arch framing the sunset */}
      <path d="M712 505 C 745 560, 700 610, 690 668" stroke="#fff" strokeOpacity="0.75" strokeWidth="7" fill="none" />
      <path d="M888 505 C 855 560, 900 610, 910 668" stroke="#fff" strokeOpacity="0.75" strokeWidth="7" fill="none" />
      <path d="M710 668 V500 A90 90 0 0 1 890 500 V668" stroke="#fffaf2" strokeWidth="9" fill="none" />
      {ARCH_FLOWERS.map((f, i) => (
        <FlowerCluster key={i} {...f} i={i} />
      ))}

      {/* guest chairs */}
      {CHAIRS.map((c) => (
        <g key={c.key} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
          <rect x="-11" y="-30" width="22" height="25" rx="3" fill="#fffaf4" stroke="#d9c6b0" strokeWidth="1.2" />
          <rect x="-13" y="-6" width="26" height="6" rx="2" fill="#fffaf4" stroke="#d9c6b0" strokeWidth="1.2" />
          <path d="M-10 0 V14 M10 0 V14" stroke="#d9c6b0" strokeWidth="2" />
          {c.bow && <circle cx="0" cy="-18" r="5" fill="#e98aa3" />}
        </g>
      ))}

      <Palm />
      <Palm mirror />
    </svg>
  )
}

function Foreground() {
  const corner = (mirror) => (
    <g transform={mirror ? 'translate(1600 0) scale(-1 1)' : undefined}>
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse
          key={`l${i}`}
          cx={20 + i * 30}
          cy={880 - rand(i + 500) * 70}
          rx="70"
          ry="22"
          transform={`rotate(${-30 - i * 12} ${20 + i * 30} ${880 - rand(i + 500) * 70})`}
          fill={i % 2 ? '#2f5433' : '#3b6a3f'}
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const x = 30 + rand(i + 540) * 230
        const y = 800 + rand(i + 570) * 90
        const r = 18 + rand(i + 600) * 14
        return (
          <g key={`r${i}`}>
            <circle cx={x} cy={y} r={r} fill={FLOWER_COLORS[i % 5]} />
            <circle cx={x + 2} cy={y - 1} r={r * 0.55} fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="3" />
          </g>
        )
      })}
    </g>
  )
  return (
    <svg className="layer layer-foreground" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {corner(false)}
      {corner(true)}
    </svg>
  )
}

const HEART =
  'M200 332 C 110 272, 38 214, 38 138 C 38 82, 80 42, 132 42 C 166 42, 188 62, 200 88 C 212 62, 234 42, 268 42 C 320 42, 362 82, 362 138 C 362 214, 290 272, 200 332 Z'

function Rings() {
  return (
    <svg className="rings-svg" viewBox="0 0 400 360" aria-hidden="true">
      <defs>
        <linearGradient id="wc-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c1" />
          <stop offset="0.3" stopColor="#e6bf6a" />
          <stop offset="0.55" stopColor="#b8862f" />
          <stop offset="0.8" stopColor="#f3d28a" />
          <stop offset="1" stopColor="#a8762a" />
        </linearGradient>
        <linearGradient id="wc-diamond" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#dff4ff" />
          <stop offset="1" stopColor="#a9cde6" />
        </linearGradient>
        <filter id="wc-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="wc-interlock">
          <rect x="182" y="188" width="36" height="40" />
        </clipPath>
      </defs>

      <path className="heart-glow" d={HEART} fill="#e0668a" filter="url(#wc-soft)" />
      <path className="heart-line" d={HEART} pathLength="1" fill="none" stroke="url(#wc-gold)" strokeWidth="3.5" strokeLinecap="round" />

      <g className="ring ring-l">
        <circle cx="172" cy="170" r="48" fill="none" stroke="url(#wc-gold)" strokeWidth="11" />
        <circle cx="172" cy="170" r="52" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeDasharray="60 270" />
      </g>
      <g className="ring ring-r">
        <circle cx="228" cy="170" r="48" fill="none" stroke="url(#wc-gold)" strokeWidth="11" />
        <circle cx="228" cy="170" r="52" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeDasharray="60 270" strokeDashoffset="-150" />
        <path d="M220 124 L228 114 L236 124" fill="none" stroke="url(#wc-gold)" strokeWidth="3" />
        <polygon points="228,96 242,110 228,126 214,110" fill="url(#wc-diamond)" stroke="#fff" strokeWidth="1" />
        <polygon className="glint" points="228,96 232,110 228,126 224,110" fill="#fff" />
      </g>
      {/* redraw a slice of the left ring on top so the two rings look linked */}
      <g className="ring ring-l" clipPath="url(#wc-interlock)">
        <circle cx="172" cy="170" r="48" fill="none" stroke="url(#wc-gold)" strokeWidth="11" />
      </g>
    </svg>
  )
}

function Words({ text, v }) {
  const words = text.split(' ')
  return words.map((w, i) => (
    <span key={i} className="word" style={{ '--i': i, '--n': words.length, '--w': `var(--${v})` }}>
      {w}{' '}
    </span>
  ))
}

// ---------- main component ----------
export default function Intro({ onDone }) {
  const scrollerRef = useRef(null)
  const stageRef = useRef(null)
  const leavingRef = useRef(false)
  const [leaving, setLeaving] = useState(false)

  const finish = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    markIntroSeen()
    setTimeout(onDone, 900)
  }, [onDone])

  useEffect(() => {
    const scroller = scrollerRef.current
    const stage = stageRef.current
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scroller.focus({ preventScroll: true })

    let target = 0
    let current = -1
    let raf = 0
    const readTarget = () => {
      const max = scroller.scrollHeight - scroller.clientHeight
      target = max > 0 ? scroller.scrollTop / max : 0
    }
    const tick = () => {
      const next = current < 0 ? target : current + (target - current) * 0.085
      const settled = Math.abs(target - next) < 0.0004 ? target : next
      if (settled !== current) {
        current = settled
        const vars = timeline(current)
        for (const k in vars) stage.style.setProperty(`--${k}`, vars[k].toFixed(4))
        stage.dataset.beat = vars.heart > 0.995 ? 'on' : 'off'
        stage.dataset.cta = vars.cta > 0.4 ? 'on' : 'off'
        stage.dataset.dark = vars.zoom > 0.5 ? 'on' : 'off'
        if (current > 0.992) finish()
      }
      raf = requestAnimationFrame(tick)
    }

    readTarget()
    scroller.addEventListener('scroll', readTarget, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener('scroll', readTarget)
      document.body.style.overflow = prevOverflow
      window.scrollTo(0, 0)
    }
  }, [finish])

  return (
    <div
      ref={scrollerRef}
      className={leaving ? 'intro intro-leaving' : 'intro'}
      tabIndex={-1}
      role="dialog"
      aria-label="WedConnect introduction"
    >
      <div className="intro-track">
        <div ref={stageRef} className="intro-stage">
          {/* 1 — the venue waiting behind the doors */}
          <div className="venue">
            <Backdrop />
            <div className="doves">
              <Bird className="dove" style={{ '--t': '0s', '--y': '14%' }} />
              <Bird className="dove" style={{ '--t': '-6s', '--y': '22%' }} />
              <Bird className="dove" style={{ '--t': '-11s', '--y': '9%' }} />
            </div>
            <Terrace />
            <Foreground />
          </div>

          {/* 2 — the wall and doors */}
          <div className="wall-layer">
            <div className="doorway">
              <div className="door-light" />
              <div className="door door-l">
                <span className="door-panel top" />
                <span className="door-panel bottom" />
                <span className="door-handle" />
                <span className="door-seal">W</span>
              </div>
              <div className="door door-r">
                <span className="door-panel top" />
                <span className="door-panel bottom" />
                <span className="door-handle" />
                <span className="door-seal">C</span>
              </div>
            </div>
            <div className="wall-floor" />
            <div className="pilaster pilaster-l" />
            <div className="pilaster pilaster-r" />
            <div className="sconce sconce-l" />
            <div className="sconce sconce-r" />
            <div className="dust">
              {Array.from({ length: 16 }, (_, i) => (
                <span key={i} style={{ left: `${rand(i + 700) * 100}%`, top: `${rand(i + 730) * 100}%`, animationDelay: `${-rand(i + 760) * 8}s` }} />
              ))}
            </div>
          </div>

          <div className="flash" />

          {/* 3 — golden birds released as the doors open */}
          <div className="flock">
            {BIRDS.map((b, i) => (
              <Bird
                key={i}
                className="flock-bird"
                style={{ '--dx': b.dx, '--dy': b.dy, '--s': b.s, '--flap': b.flap, '--lag': b.lag }}
              />
            ))}
          </div>

          <div className="petals" aria-hidden="true">
            {PETALS.map((p, i) => (
              <span
                key={i}
                style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.dur, animationDelay: p.delay, '--sway': p.sway, background: p.hue }}
              />
            ))}
          </div>

          <div className="caption">
            <span className="eyebrow">Imagine it</span>
            <p>Vows by the sea, in a garden of roses.</p>
          </div>

          {/* 4 — rings meet, a heart is drawn, the promise appears */}
          <div className="veil" />
          <div className="promise">
            <div className="rings-wrap">
              <Rings />
              <div className="sparks">
                {SPARKS.map((s, i) => (
                  <span key={i} style={{ '--x': s.x, '--y': s.y, animationDelay: s.d }} />
                ))}
              </div>
            </div>
            <h2 className="promise-line">
              <Words text="Your marriage," v="w1" />
            </h2>
            <h2 className="promise-line gold">
              <Words text="our responsibility." v="w2" />
            </h2>
            <p className="promise-brand">
              <span className="rule" />
              <span>
                Wed<span className="accent">Connect</span>
              </span>
              <span className="rule" />
            </p>
            <button type="button" className="intro-enter" onClick={finish}>
              Enter WedConnect <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* chrome */}
          <div className="intro-top">
            <span className="intro-logo">
              Wed<span>Connect</span>
            </span>
            <button type="button" className="intro-skip" onClick={finish}>
              Skip intro
            </button>
          </div>
          <div className="scroll-hint">
            <span>Scroll to open the doors</span>
            <i />
          </div>
          <div className="intro-progress" />
        </div>
      </div>
    </div>
  )
}
