"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { TagsChips } from "@/components/tags-chips"
import { ActionList } from "@/components/action-list"
import { Observations } from "@/components/observations"
import { TranscriptCollapse } from "@/components/transcript-collapse"
import { CommandPalette } from "@/components/command-palette"
import { QuickActionsDialog } from "@/components/quick-actions-dialog"
import { PrivacyFooter } from "@/components/privacy-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Lightbulb, Target, Loader2 } from "lucide-react"
import { NotesStore } from "@/lib/notes-store"
import {
  exportToMarkdown,
  exportToJSON,
  downloadFile,
  copyToClipboard,
  generateCalendarEvent,
  generateEmailDraft,
} from "@/lib/export"
import type { NoteBundle } from "@/lib/types"

interface NotePageProps {
  params: { id: string }
}

export default function NotePage({ params }: NotePageProps) {
  const router = useRouter()
  const [bundle, setBundle] = useState<NoteBundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [quickAction, setQuickAction] = useState<string | null>(null)

  useEffect(() => {
    loadNote()
  }, [params.id])

  const loadNote = async () => {
    try {
      const loadedBundle = await NotesStore.getBundle(params.id)
      if (!loadedBundle) {
        setError("Note not found")
      } else {
        setBundle(loadedBundle)
      }
    } catch (err) {
      console.error("Failed to load note:", err)
      setError("Failed to load note")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAction = async (actionId: string) => {
    if (!bundle) return

    try {
      await NotesStore.toggleActionDone(actionId)
      // Reload the bundle to get updated data
      await loadNote()
    } catch (error) {
      console.error("Failed to toggle action:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleExportMarkdown = async () => {
    if (!bundle) return

    try {
      const markdown = exportToMarkdown(bundle)
      await copyToClipboard(markdown)
      // TODO: Show success toast
    } catch (error) {
      console.error("Failed to copy markdown:", error)
    }
  }

  const handleExportJSON = () => {
    if (!bundle) return

    const json = exportToJSON(bundle)
    const filename = `${bundle.note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    downloadFile(json, filename, "application/json")
  }

  const handleQuickAction = (action: string) => {
    setQuickAction(action)
  }

  const executeQuickAction = () => {
    if (!bundle || !quickAction) return

    try {
      switch (quickAction) {
        case "email":
          const emailUrl = generateEmailDraft(bundle)
          window.open(emailUrl, "_blank")
          break
        case "calendar":
          const icsContent = generateCalendarEvent(bundle)
          const filename = `${bundle.note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`
          downloadFile(icsContent, filename, "text/calendar")
          break
        case "notion":
          // Mock success - in real implementation, this would integrate with Notion API
          console.log("Notion integration would happen here")
          break
      }
    } catch (error) {
      console.error(`Failed to execute ${quickAction}:`, error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader onOpenCommand={() => setShowCommandPalette(true)} />
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          </div>
        </div>
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
          currentNote={bundle}
          onExportMarkdown={handleExportMarkdown}
          onExportJSON={handleExportJSON}
          onQuickAction={handleQuickAction}
        />
        <QuickActionsDialog
          open={!!quickAction}
          onOpenChange={(open) => !open && setQuickAction(null)}
          action={quickAction || ""}
          onConfirm={executeQuickAction}
        />
        <PrivacyFooter />
      </div>
    )
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader onOpenCommand={() => setShowCommandPalette(true)} />
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-16 space-y-4">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-lg font-medium text-zinc-200">{error || "Note not found"}</h2>
              <Button variant="outline" onClick={() => router.push("/")} className="border-white/10 hover:bg-white/5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notes
              </Button>
            </div>
          </div>
        </div>
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
          currentNote={bundle}
          onExportMarkdown={handleExportMarkdown}
          onExportJSON={handleExportJSON}
          onQuickAction={handleQuickAction}
        />
        <QuickActionsDialog
          open={!!quickAction}
          onOpenChange={(open) => !open && setQuickAction(null)}
          action={quickAction || ""}
          onConfirm={executeQuickAction}
        />
        <PrivacyFooter />
      </div>
    )
  }

  const { note, actions, expert } = bundle

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader onOpenCommand={() => setShowCommandPalette(true)} />

      <div className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="space-y-8">
            {/* Title and Metadata */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-zinc-100 leading-tight">{note.title}</h1>

              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
                  {note.topic}
                </Badge>
              </div>

              <p className="text-lg text-zinc-300 leading-relaxed">{note.summary}</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Tags</h3>
              <TagsChips tags={note.tags} />
            </div>

            {/* Key Takeaways */}
            <Card className="bg-[#121318]/50 border-white/6">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {note.key_takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-zinc-300 leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Action Items */}
            <ActionList actions={actions} onToggleAction={handleToggleAction} editable={true} />

            {/* Expert Observations */}
            <Observations observation={expert} />

            {/* Entities */}
            {(note.entities.people.length > 0 ||
              note.entities.organizations.length > 0 ||
              note.entities.products.length > 0) && (
              <Card className="bg-[#121318]/50 border-white/6">
                <CardHeader>
                  <CardTitle className="text-zinc-100 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Mentioned Entities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {note.entities.people.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">People</h4>
                      <TagsChips tags={note.entities.people} />
                    </div>
                  )}
                  {note.entities.organizations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Organizations</h4>
                      <TagsChips tags={note.entities.organizations} />
                    </div>
                  )}
                  {note.entities.products.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-zinc-400 mb-2">Products</h4>
                      <TagsChips tags={note.entities.products} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Source Transcript */}
            <TranscriptCollapse transcript={note.transcript} />
          </div>
        </div>
      </div>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        currentNote={bundle}
        onExportMarkdown={handleExportMarkdown}
        onExportJSON={handleExportJSON}
        onQuickAction={handleQuickAction}
      />

      <QuickActionsDialog
        open={!!quickAction}
        onOpenChange={(open) => !open && setQuickAction(null)}
        action={quickAction || ""}
        onConfirm={executeQuickAction}
      />

      <PrivacyFooter />
    </div>
  )
}
