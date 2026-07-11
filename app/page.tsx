'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, Sparkles, Star } from 'lucide-react'
import { ProfileCard } from '@/components/profile-card'
import { CuteLinks } from '@/components/cute-links'
import { MusicPlayerCompact, MusicPlayerExpanded, TRACKS } from '@/components/music-player'
import { HeartTrail } from '@/components/heart-trail'
import { MusicVisualizer } from '@/components/music-visualizer'
import { AtmosphericPresence } from '@/components/atmospheric-presence'

export default function Page() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Shared Music State
  const [trackIdx, setTrackIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [liked, setLiked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = TRACKS[trackIdx]

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  // Global Audio Listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => {
      setCurrentTime(audio.currentTime)
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setTrackIdx((prev) => (prev + 1) % TRACKS.length)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  }, [trackIdx])

  // Handle track change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = currentTrack.src
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [trackIdx])

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-background selection:bg-primary/30">
      {/* Global Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="auto"
        onLoadedMetadata={() => setAudioEl(audioRef.current)}
      />

      {/* Interactive Background Layer */}
      <div
        className="touch-glow"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      <MusicVisualizer audioEl={audioEl} isPlaying={isPlaying} />
      <HeartTrail />

      {/* Atmospheric Layer */}
      <div className="absolute inset-0 z-0">
        <AtmosphericPresence isPlaying={isPlaying} />
      </div>

      {/* Floating Ornaments - Asymmetric & Organic */}
      <Heart className={`animate-organic-float pointer-events-none absolute left-[8%] top-[12%] size-8 fill-primary/10 text-primary/10 transition-all duration-700 ${isExpanded ? 'opacity-0 scale-50 blur-md' : 'opacity-100'}`} aria-hidden="true" />
      <Sparkles className={`animate-organic-float pointer-events-none absolute right-[10%] top-[18%] size-8 text-accent/20 transition-all duration-700 ${isExpanded ? 'opacity-0 scale-50 blur-md' : 'opacity-100'}`} style={{ animationDelay: '1.5s' }} aria-hidden="true" />
      <Star className={`animate-organic-float pointer-events-none absolute bottom-[12%] left-[12%] size-6 fill-accent/10 text-accent/10 transition-all duration-700 ${isExpanded ? 'opacity-0 scale-50 blur-md' : 'opacity-100'}`} style={{ animationDelay: '2.5s' }} aria-hidden="true" />
      <Heart className={`animate-organic-float pointer-events-none absolute bottom-[18%] right-[8%] size-7 fill-primary/10 text-primary/10 transition-all duration-700 ${isExpanded ? 'opacity-0 scale-50 blur-md' : 'opacity-100'}`} style={{ animationDelay: '3.5s' }} aria-hidden="true" />

      {/* Main Content Experience */}
      <div className={`relative z-10 flex min-h-dvh w-full flex-col items-center justify-between p-4 pb-6 md:p-12 transition-all duration-700 ease-in-out ${isExpanded ? 'scale-90 opacity-40 blur-md pointer-events-none' : 'scale-100 opacity-100 blur-0'}`}>

        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative flex w-full max-w-6xl flex-col items-center justify-center gap-6 md:flex-row md:gap-24">

            {/* Left Wing: Links - Floating & Offset */}
            <div className="order-2 w-full max-w-[320px] transition-all duration-700 md:order-1 md:translate-x-4 md:translate-y-8">
              <div className="premium-glass premium-glass-hover rounded-[2.5rem] p-5 sm:p-8 animate-fluid-entrance" style={{ animationDelay: '0.3s' }}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Connections</span>
                </div>
                <CuteLinks />
              </div>
            </div>

            {/* Center: The Anchor (Profile) */}
            <div className="order-1 relative flex flex-col items-center justify-center transition-all duration-1000 animate-fluid-entrance">
               {/* Light Halo behind profile */}
               <div className="absolute -inset-12 rounded-full bg-primary/10 blur-[60px] animate-aura-pulse" />
               <ProfileCard isPlaying={isPlaying} />
            </div>

            {/* Right Wing: Music - Floating & Offset */}
            <div className="order-3 w-full max-w-[360px] transition-all duration-700 md:order-3 md:-translate-x-4 md:-translate-y-12">
              <div className="premium-glass premium-glass-hover rounded-[2.5rem] p-4 sm:p-6 animate-fluid-entrance" style={{ animationDelay: '0.5s' }}>
                <MusicPlayerCompact
                  isPlaying={isPlaying}
                  onPlayingChange={setIsPlaying}
                  trackIdx={trackIdx}
                  setTrackIdx={setTrackIdx}
                  progress={progress}
                  setIsExpanded={setIsExpanded}
                  audioRef={audioRef}
                  onAudioElement={setAudioEl}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Final touch: Minimalist footer */}
        <footer className="flex flex-col items-center gap-2 text-center">
          <p className="font-mono text-[9px] tracking-[0.4em] text-muted-foreground/40 uppercase">
            Existence over Templates
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">
            made with <span className="text-primary animate-heartbeat inline-block">{'♥'}</span> by ramochka
          </p>
        </footer>
      </div>

      {/* Expanded Player - Rendered outside the transformed container to avoid layout bugs */}
      {isExpanded && (
        <MusicPlayerExpanded
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
          trackIdx={trackIdx}
          setTrackIdx={setTrackIdx}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          setProgress={setProgress}
          setCurrentTime={setCurrentTime}
          setDuration={setDuration}
          setIsExpanded={setIsExpanded}
          liked={liked}
          setLiked={setLiked}
          showToast={(msg) => console.log(msg)}
          audioRef={audioRef}
        />
      )}
    </main>
  )
}
