'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BentoTileProps {
  children: ReactNode
  className?: string
  delay?: string
}

export function BentoTile({ children, className, delay = '0s' }: BentoTileProps) {
  return (
    <div
      className={cn(
        'glass glass-hover rounded-3xl p-6 animate-bento-enter relative overflow-hidden group',
        className
      )}
      style={{ animationDelay: delay }}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  )
}
