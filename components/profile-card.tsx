'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

const AVATAR_URL =
  'https://github.com/fuckramochka/biosite/blob/main/f0f9f404yyyye7440b8eba0b141aac33c354.jpg?raw=true'

const QUOTES = [
  '"I-It\'s not like I coded this for you!"',
  'пишу код и слушаю Стрыкало',
  'python enjoyer',
  'философия > дедлайны',
]

export function ProfileCard({ isPlaying }: { isPlaying: boolean }) {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      // Calculate tilt based on mouse position relative to center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (clientY - centerY) / 50;
      const y = (centerX - clientX) / 50;
      setRotate({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const quote = QUOTES[quoteIdx]
    let i = 0
    setTyped('')
    const typeInterval = setInterval(() => {
      i++
      setTyped(quote.slice(0, i))
      if (i >= quote.length) clearInterval(typeInterval)
    }, 45)
    const nextTimeout = setTimeout(
      () => setQuoteIdx((q) => (q + 1) % QUOTES.length),
      quote.length * 45 + 3500,
    )
    return () => {
      clearInterval(typeInterval)
      clearTimeout(nextTimeout)
    }
  }, [quoteIdx])

  return (
    <section
      aria-label="Профиль"
      className="flex flex-col items-center gap-4 sm:gap-6 text-center transition-transform duration-200 ease-out"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
      }}
    >
      <div className="relative group">
        {/* Advanced spinning ring with glass effect */}
        <div
          className={`absolute -inset-3 sm:-inset-4 rounded-full transition-all duration-700 ${
            isPlaying ? 'opacity-100 scale-110 animate-spin-slow' : 'opacity-0 scale-90'
          }`}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0%, oklch(0.72 0.18 350 / 40%) 25%, transparent 50%, oklch(0.92 0.05 160 / 40%) 75%, transparent 100%)',
            filter: 'blur(4px)'
          }}
          aria-hidden="true"
        />

        <div className="relative size-24 sm:size-40 overflow-hidden rounded-full border-4 border-white/50 bg-secondary shadow-[0_20px_50px_oklch(0.72_0.18_350_/_0.2)] transition-transform duration-500 group-hover:scale-105">
          {avatarError ? (
            <div className="flex size-full items-center justify-center font-mono text-5xl font-bold text-primary">
              R
            </div>
          ) : (
            <img
              src={AVATAR_URL || '/placeholder.svg'}
              alt="Аватар ramochka"
              className="size-full object-cover"
              onError={() => setAvatarError(true)}
            />
          )}
        </div>

        {/* Premium status badge */}
        <div
          className={`absolute -bottom-1 -right-1 flex size-8 sm:size-10 items-center justify-center rounded-full border-4 border-white transition-all duration-500 ${
            isPlaying ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {isPlaying ? (
            <div className="flex items-end gap-px" style={{ height: 10 }} aria-hidden="true">
              <span className="eq-bar w-0.5 rounded-full bg-white" style={{ height: 10 }} />
              <span className="eq-bar w-0.5 rounded-full bg-white" style={{ height: 10, animationDelay: '0.2s' }} />
              <span className="eq-bar w-0.5 rounded-full bg-white" style={{ height: 10, animationDelay: '0.4s' }} />
            </div>
          ) : (
            <Heart className="size-3 sm:size-4 fill-current animate-heartbeat" aria-hidden="true" />
          )}
          <span className="sr-only">{isPlaying ? 'Слушает музыку' : 'Онлайн'}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl sm:text-6xl font-black tracking-tighter text-balance">
          ramochka<span className="text-primary">_</span>
        </h1>
        <div className="relative px-4 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <p className="min-h-5 font-mono text-xs text-muted-foreground sm:text-sm">
            {typed}
            <span className="text-primary animate-blink">▌</span>
          </p>
        </div>
      </div>
    </section>
  )
}
