"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { StructuredNote } from "@/lib/types"

interface NoteCardProps {
  note: StructuredNote
  onClick?: () => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  return (
    <Card
      className="bg-[#121318]/80 border-white/6 hover:border-white/12 transition-all duration-200 cursor-pointer hover:bg-[#121318]/90 backdrop-blur-sm rounded-xl active:scale-[0.98] sm:active:scale-100"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-zinc-100 line-clamp-2 text-base sm:text-sm leading-snug">{note.title}</h3>
          <p className="text-sm text-zinc-300 line-clamp-3 sm:line-clamp-2 leading-relaxed">{note.summary}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-2 py-1 bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 rounded-md"
            >
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1 bg-white/5 text-zinc-400 border-white/10 rounded-md"
            >
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 border-blue-500/20 rounded-md"
          >
            {note.topic}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
