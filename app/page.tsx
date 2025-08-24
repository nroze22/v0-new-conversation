"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { NoteCard } from "@/components/note-card"
import { RecordingInterface } from "@/components/recording-interface"
import { TagsChips } from "@/components/tags-chips"
import { CommandPalette } from "@/components/command-palette"
import { PrivacyFooter } from "@/components/privacy-footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Loader2 } from "lucide-react"
import { NotesStore } from "@/lib/notes-store"
import { processTranscript, generateId } from "@/lib/gemini"
import type { NoteBundle, StructuredNote, ActionItem, ExpertObservation } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [notes, setNotes] = useState<NoteBundle[]>([])
  const [filteredNotes, setFilteredNotes] = useState<NoteBundle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [])

  // Filter notes when search or tags change
  useEffect(() => {
    filterNotes()
  }, [notes, searchQuery, selectedTags])

  const loadNotes = async () => {
    try {
      const loadedNotes = await NotesStore.listBundles()
      setNotes(loadedNotes)
    } catch (error) {
      console.error("Failed to load notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((bundle) => {
        const { note } = bundle
        const query = searchQuery.toLowerCase()
        return (
          note.title.toLowerCase().includes(query) ||
          note.summary.toLowerCase().includes(query) ||
          note.topic.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          note.key_takeaways.some((takeaway) => takeaway.toLowerCase().includes(query))
        )
      })
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((bundle) => selectedTags.some((selectedTag) => bundle.note.tags.includes(selectedTag)))
    }

    setFilteredNotes(filtered)
  }

  const handleTranscriptComplete = async (transcript: string) => {
    setIsProcessing(true)
    setShowRecording(false)

    try {
      // Process transcript through Gemini
      const result = await processTranscript(transcript)

      // Create note bundle
      const noteId = generateId()
      const note: StructuredNote = {
        id: noteId,
        ...result.structured,
        transcript,
        createdAt: new Date().toISOString(),
      }

      const actions: ActionItem[] = result.actions.map((action: any) => ({
        ...action,
        id: generateId(),
        noteId,
        status: "open" as const,
      }))

      const expert: ExpertObservation = {
        ...result.observations,
        noteId,
      }

      const bundle: NoteBundle = { note, actions, expert }

      // Save to storage
      await NotesStore.saveBundle(bundle)

      // Refresh notes list
      await loadNotes()

      // Navigate to the new note
      router.push(`/note/${noteId}`)
    } catch (error) {
      console.error("Failed to process transcript:", error)
      // TODO: Show error toast
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const getAllTags = () => {
    const tagSet = new Set<string>()
    notes.forEach((bundle) => {
      bundle.note.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }

  const handleFilterByTag = (tag: string) => {
    setSelectedTags([tag])
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader onOpenCommand={() => setShowCommandPalette(true)} />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          </div>
        </div>
        <CommandPalette
          open={showCommandPalette}
          onOpenChange={setShowCommandPalette}
          allTags={getAllTags()}
          onStartRecording={() => setShowRecording(true)}
          onFilterByTag={handleFilterByTag}
        />
        <PrivacyFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader onOpenCommand={() => setShowCommandPalette(true)} />

      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search notes, tags, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-[#121318]/50 border-white/6 focus:border-blue-500/50 rounded-xl"
              />
            </div>

            {/* Tag filters */}
            {getAllTags().length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400 font-medium">Filter by tags:</p>
                <TagsChips
                  tags={getAllTags()}
                  selectedTags={selectedTags}
                  onTagClick={handleTagClick}
                  onTagRemove={handleTagRemove}
                  showRemove={selectedTags.length > 0}
                />
              </div>
            )}
          </div>

          {/* Recording Interface */}
          {showRecording && (
            <Card className="bg-[#121318]/50 border-white/6 rounded-xl">
              <CardContent className="p-4 sm:p-6">
                <RecordingInterface onTranscriptComplete={handleTranscriptComplete} isProcessing={isProcessing} />
              </CardContent>
            </Card>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 sm:py-16 space-y-4 px-4">
              {notes.length === 0 ? (
                <>
                  <div className="text-5xl sm:text-6xl mb-4">🎙️</div>
                  <h2 className="text-lg sm:text-xl font-semibold text-zinc-100">Welcome to Nocturne</h2>
                  <p className="text-zinc-300 max-w-sm mx-auto text-sm sm:text-base leading-relaxed">
                    Transform your voice notes into structured insights with AI-powered analysis.
                  </p>
                  <Button
                    onClick={() => setShowRecording(true)}
                    className="bg-blue-600 hover:bg-blue-700 h-12 px-6 text-base rounded-xl"
                    disabled={isProcessing}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Note
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-3xl sm:text-4xl mb-4">🔍</div>
                  <h2 className="text-base sm:text-lg font-medium text-zinc-100">No notes found</h2>
                  <p className="text-zinc-300 text-sm">Try adjusting your search or filters</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedTags([])
                    }}
                    className="border-white/10 hover:bg-white/5 h-10 px-4 rounded-xl"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredNotes.map((bundle) => (
                <NoteCard
                  key={bundle.note.id}
                  note={bundle.note}
                  onClick={() => router.push(`/note/${bundle.note.id}`)}
                />
              ))}
            </div>
          )}

          {/* Floating Record Button */}
          {!showRecording && (
            <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50">
              <Button
                onClick={() => setShowRecording(true)}
                size="lg"
                className="h-16 w-16 sm:h-14 sm:w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-500/20"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-7 w-7 sm:h-6 sm:w-6 animate-spin" />
                ) : (
                  <Plus className="h-7 w-7 sm:h-6 sm:w-6" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        allTags={getAllTags()}
        onStartRecording={() => setShowRecording(true)}
        onFilterByTag={handleFilterByTag}
      />

      <PrivacyFooter />
    </div>
  )
}
