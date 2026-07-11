'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  rotation: number
  spin: number
  color: string
  kind: 'heart' | 'sparkle'
}

const COLORS = ['#f02d6b', '#ff7ba3', '#ffb3c9', '#ffd6e2']

function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(0, s * 0.6)
  ctx.bezierCurveTo(-s * 1.4, -s * 0.5, -s * 0.5, -s * 1.4, 0, -s * 0.4)
  ctx.bezierCurveTo(s * 0.5, -s * 1.4, s * 1.4, -s * 0.5, 0, s * 0.6)
  ctx.closePath()
  ctx.fill()
}

function drawSparkle(ctx: CanvasRenderingContext2D, size: number) {
  const s = size / 2
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0)
  ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s)
  ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0)
  ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s)
  ctx.closePath()
  ctx.fill()
}

export function HeartTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Particle[] = []
    let rafId = 0
    let lastSpawn = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (x: number, y: number, burst = false) => {
      const count = burst ? 3 : 1
      for (let i = 0; i < count; i++) {
        const isHeart = Math.random() > 0.35
        particles.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.5 - Math.random() * 0.9,
          size: isHeart ? 7 + Math.random() * 8 : 5 + Math.random() * 6,
          life: 0,
          maxLife: 50 + Math.random() * 40,
          rotation: (Math.random() - 0.5) * 0.6,
          spin: (Math.random() - 0.5) * 0.04,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          kind: isHeart ? 'heart' : 'sparkle',
        })
      }
      if (particles.length > 90) particles = particles.slice(-90)
    }

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - lastSpawn < 40) return
      lastSpawn = now
      spawn(e.clientX, e.clientY)
    }

    const onPointerDown = (e: PointerEvent) => {
      spawn(e.clientX, e.clientY, true)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      particles = particles.filter((p) => p.life < p.maxLife)
      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.005
        p.rotation += p.spin
        const fade = 1 - p.life / p.maxLife
        const scale = 0.5 + fade * 0.5

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = fade * 0.9
        ctx.fillStyle = p.color
        if (p.kind === 'heart') drawHeart(ctx, p.size)
        else drawSparkle(ctx, p.size)
        ctx.restore()
      }

      ctx.restore()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  )
}
