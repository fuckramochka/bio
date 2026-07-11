'use client'

import { useEffect, useRef } from 'react'

type OrbitParticle = {
  angle: number
  baseRadius: number
  speed: number
  size: number
  color: string
  wobble: number
}

const COLORS = ['#f02d6b', '#ff7ba3', '#ffb3c9']

export function MusicVisualizer({
  audioEl,
  isPlaying,
}: {
  audioEl: HTMLAudioElement | null
  isPlaying: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ctxAudioRef = useRef<AudioContext | null>(null)
  const connectedElRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying

  // подключаем Web Audio API к элементу audio (только один раз на элемент)
  useEffect(() => {
    if (!audioEl || !isPlaying) return
    if (connectedElRef.current === audioEl) {
      ctxAudioRef.current?.resume()
      return
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioCtx = new AudioCtx()
      const source = audioCtx.createMediaElementSource(audioEl)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      ctxAudioRef.current = audioCtx
      analyserRef.current = analyser
      connectedElRef.current = audioEl
      audioCtx.resume()
    } catch {
      // Web Audio недоступен — просто без визуализации
    }
  }, [audioEl, isPlaying])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let energy = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: OrbitParticle[] = Array.from({ length: 26 }, (_, i) => ({
      angle: (i / 26) * Math.PI * 2,
      baseRadius: 0.75 + Math.random() * 0.45,
      speed: 0.002 + Math.random() * 0.004,
      size: 2 + Math.random() * 3.5,
      color: COLORS[i % COLORS.length],
      wobble: Math.random() * Math.PI * 2,
    }))

    const freqData = new Uint8Array(64)

    const tick = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const w = window.innerWidth
      const h = window.innerHeight
      const cx = w / 2
      const cy = h / 2

      // читаем спектр если музыка играет
      let target = 0
      const analyser = analyserRef.current
      if (analyser && isPlayingRef.current) {
        analyser.getByteFrequencyData(freqData)
        let bass = 0
        for (let i = 0; i < 10; i++) bass += freqData[i]
        target = bass / 10 / 255
      }
      // сглаживание — плавно нарастает и затухает
      energy += (target - energy) * 0.12

      if (energy > 0.01) {
        // мягкое пульсирующее свечение в центре
        const glowR = Math.min(w, h) * (0.32 + energy * 0.22)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
        grad.addColorStop(0, `rgba(240, 45, 107, ${0.10 + energy * 0.14})`)
        grad.addColorStop(0.6, `rgba(255, 123, 163, ${0.05 + energy * 0.08})`)
        grad.addColorStop(1, 'rgba(255, 123, 163, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)

        // танцующие частицы по орбите
        const orbitBase = Math.min(w, h) * 0.36
        for (const p of particles) {
          p.angle += p.speed * (1 + energy * 2.5)
          const wob = Math.sin(t * 0.002 + p.wobble) * 10
          const r = orbitBase * p.baseRadius + energy * 46 + wob
          const x = cx + Math.cos(p.angle) * r
          const y = cy + Math.sin(p.angle) * r * 0.82
          const size = p.size * (0.7 + energy * 1.6)

          ctx.globalAlpha = (0.25 + energy * 0.55) * (0.6 + Math.sin(t * 0.003 + p.wobble) * 0.4)
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      ctx.restore()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}
