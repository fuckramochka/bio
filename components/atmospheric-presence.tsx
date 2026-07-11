'use client'

import { useEffect, useState } from 'react'

export function AtmosphericPresence({ isPlaying }: { isPlaying: boolean }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // To avoid hydration mismatch, we only render the random particles on the client
  if (!mounted) {
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
      {/* The Aura - An evolving, shimmering light entity */}
      <div
        className={`absolute size-64 rounded-full transition-all duration-1000 ease-out blur-[80px] ${
          isPlaying ? 'opacity-60 scale-125 animate-aura-pulse' : 'opacity-30 scale-100'
        }`}
        style={{
          background: `radial-gradient(circle, oklch(0.72 0.18 350 / 0.6) 0%, oklch(0.85 0.1 160 / 0.4) 50%, transparent 100%)`,
          transform: `translate(${mousePos.x / 20}px, ${mousePos.y / 20}px)`,
        }}
      />

      {/* Floating particles that react to music */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => {
          // Generate random values only on the client
          const width = Math.random() * 6 + 2;
          const height = Math.random() * 6 + 2;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;
          const opacity = Math.random() * 0.5 + 0.2;

          return (
            <div
              key={i}
              className={`absolute rounded-full bg-white/40 transition-all duration-1000 ${
                isPlaying ? 'animate-organic-float' : 'opacity-20'
              }`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                opacity: opacity,
              }}
            />
          );
        })}
      </div>
    </div>
  )
}
