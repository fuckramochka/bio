'use client'

import { ArrowUpRight, Code, GitBranch, Send } from 'lucide-react'

const LINKS = [
  {
    label: 'GitHub',
    desc: 'Харука — юзербот для телеграма',
    href: 'https://github.com/fuckramochka/haruka.git',
    icon: <GitBranch className="size-5" aria-hidden="true" />,
    color: 'oklch(0.72 0.18 350)'
  },
  {
    label: 'Telegram',
    desc: 'канал про философию и психологию',
    href: 'https://t.me/fuckramochka',
    icon: <Send className="size-5" aria-hidden="true" />,
    color: 'oklch(0.85 0.1 160)'
  },
  {
    label: 'Market',
    desc: 'мой маркет',
    href: 'https://ramochka-market.netlify.app',
    icon: <Code className="size-5" aria-hidden="true" />,
    color: 'oklch(0.88 0.12 85)'
  },
]

export function CuteLinks() {
  return (
    <nav aria-label="Мои ссылки" className="flex w-full flex-col gap-2 sm:gap-3">
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3 rounded-2xl border border-white/40 bg-white/30 p-2 sm:p-3 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/50 hover:shadow-xl active:scale-95"
        >
          {/* Accent glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ backgroundColor: link.color }}
          />

          <span
            className="relative z-10 flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-white/60 text-foreground shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            {link.icon}
          </span>

          <span className="relative z-10 min-w-0 flex-1">
            <span className="block text-sm font-bold tracking-tight">{link.label}</span>
            <span className="block truncate text-[10px] sm:text-[11px] text-muted-foreground/80">{link.desc}</span>
          </span>

          <ArrowUpRight
            className="relative z-10 size-4 shrink-0 text-muted-foreground/50 transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </a>
      ))}
    </nav>
  )
}
