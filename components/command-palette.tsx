"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Mic, Download, Copy, Mail, Calendar, ExternalLink, Tag, FileText } from "lucide-react"
import type { NoteBundle } from "@/lib/types"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentNote?: NoteBundle | null
  allTags?: string[]
  onStartRecording?: () => void
  onSearch?: (query: string) => void
  onFilterByTag?: (tag: string) => void
  onExportMarkdown?: () => void
  onExportJSON?: () => void
  onQuickAction?: (action: string) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  currentNote,
  allTags = [],
  onStartRecording,
  onSearch,
  onFilterByTag,
  onExportMarkdown,
  onExportJSON,
  onQuickAction,
}: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => onStartRecording?.())}>
            <Mic className="mr-2 h-4 w-4" />
            <span>Start Recording</span>
          </CommandItem>

          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>View All Notes</span>
          </CommandItem>
        </CommandGroup>

        {currentNote && (
          <CommandGroup heading="Current Note">
            <CommandItem onSelect={() => runCommand(() => onExportMarkdown?.())}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy as Markdown</span>
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => onExportJSON?.())}>
              <Download className="mr-2 h-4 w-4" />
              <span>Download JSON</span>
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => onQuickAction?.("email"))}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Draft Email</span>
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => onQuickAction?.("calendar"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Create Calendar Event</span>
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => onQuickAction?.("notion"))}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Send to Notion</span>
            </CommandItem>
          </CommandGroup>
        )}

        {allTags.length > 0 && (
          <CommandGroup heading="Filter by Tag">
            {allTags.slice(0, 8).map((tag) => (
              <CommandItem key={tag} onSelect={() => runCommand(() => onFilterByTag?.(tag))}>
                <Tag className="mr-2 h-4 w-4" />
                <span>{tag}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
