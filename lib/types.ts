export type Priority = "low" | "med" | "high"

export interface StructuredNote {
  id: string
  title: string
  summary: string
  key_takeaways: string[]
  entities: {
    people: string[]
    organizations: string[]
    products: string[]
  }
  topic: string
  tags: string[] // 3–8 tags
  transcript: string // raw transcript text
  createdAt: string // ISO
}

export interface ActionItem {
  id: string
  noteId: string
  title: string
  owner: string | null
  due_date: string | null // YYYY-MM-DD or null
  priority: Priority
  confidence: number // 0..1
  status: "open" | "done"
}

export interface ExpertObservation {
  noteId: string
  persona: "Product Manager" | "Sales Coach" | "Fitness Coach" | "Clinical Ops PM" | "Parenting Coach"
  observations: { headline: string; detail: string }[]
}

export interface NoteBundle {
  note: StructuredNote
  actions: ActionItem[]
  expert: ExpertObservation
}

export interface SpeechState {
  isSupported: boolean
  isRecording: boolean
  interim: string
  finalText: string
  error: string | null
}
