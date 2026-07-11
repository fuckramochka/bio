'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Heart, Music, Pause, Play, SkipBack, SkipForward } from 'lucide-react'

type Track = {
  title: string
  artist: string
  src: string
  cover: string
}

export const TRACKS: Track[] = [
  { title: 'Девчонкам', artist: 'Cupsize', src: '/music/devchonkam.mp3', cover: 'https://github.com/fuckramochka/biosite/blob/main/f0f9f404yyyye7440b8eba0b141aac33c354.jpg?raw=true' },
  { title: 'ты не такая', artist: 'Валентин Стрыкало', src: '/music/ty-ne-takaya.mp3', cover: 'https://github.com/fuckramochka/biosite/blob/main/f0f9f404yyyye7440b8eba0b141aac33c354.jpg?raw=true' },
  { title: 'Я ночью плачу и дрочу', artist: 'Валентин Стрыкало', src: '/music/ya-nochy-plachy-i-drochu.mp3', cover: 'https://github.com/fuckramochka/biosite/blob/main/f0f9f404yyyye7440b8eba0b141aac33c354.jpg?raw=true' },
]

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function WaveProgress({
  progress,
  onSeek,
  currentTime,
  duration,
  compact = false,
}: {
  progress: number
  onSeek: (ratio: number) => void
  currentTime?: number
  duration?: number
  compact?: boolean
}) {
  const barRef = useRef<HTMLDivElement>(null)

  const handleSeek = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    onSeek(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)))
  }

  const wavePath = Array.from({ length: 16 }, (_, i) => {
    const x = i * 24
    return `M ${x} 6 Q ${x + 6} 0 ${x + 12} 6 T ${x + 24} 6`
  }).join(' ')

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        ref={barRef}
        role="slider"
        aria-label="Прогресс трека"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        tabIndex={0}
        className={`relative ${compact ? 'h-8' : 'h-10'} w-full cursor-pointer touch-none select-none group`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          handleSeek(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) handleSeek(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(1, (progress + 5) / 100))
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, (progress - 5) / 100))
        }}
      >
        <svg className="absolute inset-x-0 top-1/2 h-3 w-full -translate-y-1/2 text-primary/20" viewBox="0 0 384 12" preserveAspectRatio="none" aria-hidden="true">
          <path d={wavePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden transition-all duration-300" style={{ width: `${progress}%` }} aria-hidden="true">
          <svg className="h-3 w-full text-primary" viewBox="0 0 384 12" preserveAspectRatio="none">
            <path d={wavePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_oklch(0.72_0.18_350_/_0.6)] transition-transform duration-200 group-hover:scale-125"
          style={{ left: `calc(${progress}% - 8px)` }}
          aria-hidden="true"
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between font-mono text-[10px] font-bold text-muted-foreground px-1">
          <span>{formatTime(currentTime || 0)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      )}
    </div>
  )
}

interface PlayerProps {
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
  trackIdx: number
  setTrackIdx: (idx: number) => void
  progress: number
  currentTime: number
  duration: number
  setProgress: (p: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  onAudioElement: (el: HTMLAudioElement | null) => void
  setIsExpanded: (expanded: boolean) => void
  liked: boolean
  setLiked: (l: boolean) => void
  showToast: (msg: string) => void
  audioRef: React.RefObject<HTMLAudioElement>
}

export function MusicPlayerCompact({
  isPlaying,
  onPlayingChange,
  trackIdx,
  setTrackIdx,
  progress,
  setIsExpanded,
  audioRef,
  onAudioElement,
}: PlayerProps & { setProgress: any, setCurrentTime: any, setDuration: any, liked: any, setLiked: any, showToast: any }) {
  const track = TRACKS[trackIdx]

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      onPlayingChange(false)
      return
    }
    try {
      await audio.play()
      onPlayingChange(true)
    } catch {
      onPlayingChange(false)
    }
  }

  const nextTrack = () => {
    const nextIdx = (trackIdx + 1) % TRACKS.length
    setTrackIdx(nextIdx)
    onPlayingChange(false)
    setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.load()
        await audioRef.current.play()
        onPlayingChange(true)
      }
    }, 0)
  }

  return (
    <section
      aria-label="Музыкальный плеер"
      className="relative w-full rounded-2xl border border-white/40 bg-white/30 p-3 sm:p-4 backdrop-blur-md transition-all duration-500 hover:bg-white/50"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label="Открыть плеер"
        className="flex w-full items-center gap-3 sm:gap-4 text-left transition-colors group"
      >
        <div
          className={`relative flex size-10 sm:size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm transition-all duration-500 ${
            isPlaying ? 'animate-pulse-glow scale-105' : ''
          }`}
          aria-hidden="true"
        >
          <img src={track.cover || "/placeholder.svg"} alt="" className="size-full object-cover" />
          {isPlaying && <div className="absolute inset-0 bg-primary/20" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{track.title}</div>
          <div className="truncate text-[10px] sm:text-[11px] text-muted-foreground font-medium">{track.artist}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className={`flex size-9 sm:size-10 items-center justify-center rounded-full transition-all duration-300 shadow-sm hover:scale-110 active:scale-90 ${
              isPlaying ? 'bg-primary text-primary-foreground' : 'bg-white/80 text-foreground'
            }`}
          >
            {isPlaying ? <Pause className="size-3.5 sm:size-4" /> : <Play className="ml-0.5 size-3.5 sm:size-4" />}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              nextTrack()
            }}
            className="flex size-9 sm:size-10 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm transition-all duration-300 hover:scale-110 active:scale-90"
          >
            <SkipForward className="size-3.5 sm:size-4" />
          </span>
        </div>
      </button>
      <div className="mt-3 sm:mt-4 relative">
         <WaveProgress progress={progress} onSeek={() => {}} compact />
      </div>
      <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
        {TRACKS.map((t, i) => (
          <button
            key={t.title}
            type="button"
            onClick={() => setTrackIdx(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === trackIdx ? 'w-6 bg-primary shadow-[0_0_8px_oklch(0.72_0.18_350_/_0.6)]' : 'w-1.5 bg-primary/20 hover:bg-primary/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export function MusicPlayerExpanded({
  isPlaying,
  onPlayingChange,
  trackIdx,
  setTrackIdx,
  progress,
  currentTime,
  duration,
  setProgress,
  setCurrentTime,
  setDuration,
  setIsExpanded,
  liked,
  setLiked,
  showToast,
  audioRef,
}: PlayerProps) {
  const track = TRACKS[trackIdx]

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      onPlayingChange(false)
      return
    }
    try {
      await audio.play()
      onPlayingChange(true)
    } catch {
      onPlayingChange(false)
      showToast('Помилка відтворення')
    }
  }

  const nextTrack = () => {
    const nextIdx = (trackIdx + 1) % TRACKS.length
    setTrackIdx(nextIdx)
    onPlayingChange(false)
    setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.load()
        await audioRef.current.play()
        onPlayingChange(true)
      }
    }, 0)
  }

  const prevTrack = () => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    const prevIdx = (trackIdx - 1 + TRACKS.length) % TRACKS.length
    setTrackIdx(prevIdx)
    onPlayingChange(false)
    setTimeout(async () => {
      if (audioRef.current) {
        audioRef.current.load()
        await audioRef.current.play()
        onPlayingChange(true)
      }
    }, 0)
  }

  const seekTo = (ratio: number) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = ratio * audio.duration
    setProgress(ratio * 100)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Плеер"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={track.cover || "/placeholder.svg"}
          alt=""
          className="size-full object-cover scale-110 blur-3xl opacity-50 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        aria-label="Закрыть плеер"
        className="absolute top-8 right-8 z-30 flex size-12 items-center justify-center rounded-full bg-black/10 text-foreground shadow-sm backdrop-blur-2xl transition-transform hover:scale-110 active:scale-90"
      >
        <ChevronDown className="size-6" />
      </button>

      <div className="relative z-10 w-full max-w-md animate-spring-up flex flex-col items-center">
        <div className="relative w-full aspect-square mb-10 group">
          <div className={`absolute inset-0 rounded-[2rem] bg-primary/10 blur-3xl transition-all duration-700 ${isPlaying ? 'scale-110 opacity-60' : 'scale-100 opacity-30'}`} />
          <div className={`relative w-full h-full overflow-hidden rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-700 ease-out ${isPlaying ? 'scale-100 rotate-0' : 'scale-90 rotate-1'}`}>
            <img src={track.cover || "/placeholder.svg"} alt={`Обложка: ${track.title}`} className="size-full object-cover" />
          </div>
        </div>

        <div className="w-full flex flex-col items-start mb-8 px-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate w-full text-left leading-tight">
            {track.title}
          </h2>
          <p className="text-lg sm:text-xl font-medium text-muted-foreground truncate w-full text-left opacity-80">
            {track.artist}
          </p>
        </div>

        <div className="w-full rounded-[2.5rem] border border-white/30 bg-white/10 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <WaveProgress
              progress={progress}
              onSeek={seekTo}
              currentTime={currentTime}
              duration={duration}
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className="flex size-12 sm:size-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-90 text-muted-foreground hover:text-foreground"
            >
              <Heart
                className={`size-6 sm:size-7 transition-all duration-300 ${
                  liked ? 'fill-primary text-primary animate-heartbeat' : ''
                }`}
              />
            </button>

            <div className="flex items-center gap-6 sm:gap-10">
              <button
                type="button"
                onClick={prevTrack}
                className="flex size-12 sm:size-14 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:scale-110 active:scale-90"
              >
                <SkipBack className="size-7 sm:size-8 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 active:scale-95"
              >
                {isPlaying ? <Pause className="size-8 sm:size-9 fill-current" /> : <Play className="ml-1 size-8 sm:size-9 fill-current" />}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="flex size-12 sm:size-14 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:scale-110 active:scale-90"
              >
                <SkipForward className="size-7 sm:size-8 fill-current" />
              </button>
            </div>

            <div className="size-12 sm:size-14" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
