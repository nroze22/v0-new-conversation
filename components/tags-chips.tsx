"use client"

import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagsChipsProps {
  tags: string[]
  selectedTags?: string[]
  onTagClick?: (tag: string) => void
  onTagRemove?: (tag: string) => void
  showRemove?: boolean
}

export function TagsChips({ tags, selectedTags = [], onTagClick, onTagRemove, showRemove = false }: TagsChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag)

        return (
          <Badge
            key={tag}
            variant={isSelected ? "default" : "secondary"}
            className={`
              cursor-pointer transition-all duration-200 group h-8 px-3 text-sm rounded-lg
              ${
                isSelected
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                  : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:border-white/20"
              }
              ${showRemove ? "pr-2" : ""}
              active:scale-95 transition-transform
            `}
            onClick={() => onTagClick?.(tag)}
          >
            <span>{tag}</span>
            {showRemove && onTagRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTagRemove(tag)
                }}
                className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors touch-manipulation"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        )
      })}
    </div>
  )
}
