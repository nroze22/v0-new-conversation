"use client"

import { Command } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppHeaderProps {
  onOpenCommand?: () => void
}

export function AppHeader({ onOpenCommand }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/6 bg-[#0B0C10]/80 backdrop-blur-md">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-zinc-100">Nocturne</h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenCommand}
          className="gap-2 text-zinc-300 hover:text-zinc-100 hover:bg-white/5 border border-white/10 h-9 px-3 rounded-lg"
        >
          <Command className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Cmd+K</span>
        </Button>
      </div>
    </header>
  )
}
