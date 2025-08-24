import { get, set, del } from "idb-keyval"
import type { NoteBundle, ActionItem } from "./types"

const NOTES_INDEX_KEY = "notes:index"

export class NotesStore {
  static async saveBundle(bundle: NoteBundle): Promise<void> {
    const noteKey = `notes:${bundle.note.id}`
    await set(noteKey, bundle)

    // Update index
    const index = await this.getNotesIndex()
    const updatedIndex = [bundle.note.id, ...index.filter((id) => id !== bundle.note.id)]
    await set(NOTES_INDEX_KEY, updatedIndex)
  }

  static async getBundle(id: string): Promise<NoteBundle | null> {
    const noteKey = `notes:${id}`
    return (await get(noteKey)) || null
  }

  static async listBundles(): Promise<NoteBundle[]> {
    const index = await this.getNotesIndex()
    const bundles: NoteBundle[] = []

    for (const id of index) {
      const bundle = await this.getBundle(id)
      if (bundle) bundles.push(bundle)
    }

    return bundles
  }

  static async deleteBundle(id: string): Promise<void> {
    const noteKey = `notes:${id}`
    await del(noteKey)

    // Update index
    const index = await this.getNotesIndex()
    const updatedIndex = index.filter((noteId) => noteId !== id)
    await set(NOTES_INDEX_KEY, updatedIndex)
  }

  static async search(query: string): Promise<NoteBundle[]> {
    const bundles = await this.listBundles()
    const searchTerm = query.toLowerCase()

    return bundles.filter((bundle) => {
      const { note } = bundle
      return (
        note.title.toLowerCase().includes(searchTerm) ||
        note.summary.toLowerCase().includes(searchTerm) ||
        note.topic.toLowerCase().includes(searchTerm) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        note.key_takeaways.some((takeaway) => takeaway.toLowerCase().includes(searchTerm))
      )
    })
  }

  static async toggleActionDone(actionId: string): Promise<void> {
    const bundles = await this.listBundles()

    for (const bundle of bundles) {
      const action = bundle.actions.find((a) => a.id === actionId)
      if (action) {
        action.status = action.status === "open" ? "done" : "open"
        await this.saveBundle(bundle)
        break
      }
    }
  }

  static async updateAction(actionId: string, updates: Partial<ActionItem>): Promise<void> {
    const bundles = await this.listBundles()

    for (const bundle of bundles) {
      const actionIndex = bundle.actions.findIndex((a) => a.id === actionId)
      if (actionIndex !== -1) {
        bundle.actions[actionIndex] = { ...bundle.actions[actionIndex], ...updates }
        await this.saveBundle(bundle)
        break
      }
    }
  }

  private static async getNotesIndex(): Promise<string[]> {
    return (await get(NOTES_INDEX_KEY)) || []
  }
}
