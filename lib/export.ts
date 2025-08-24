import type { NoteBundle } from "./types"

export function exportToMarkdown(bundle: NoteBundle): string {
  const { note, actions, expert } = bundle

  let markdown = `# ${note.title}\n\n`

  // Metadata
  markdown += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n`
  markdown += `**Topic:** ${note.topic}\n`
  markdown += `**Tags:** ${note.tags.join(", ")}\n\n`

  // Summary
  markdown += `## Summary\n\n${note.summary}\n\n`

  // Key Takeaways
  markdown += `## Key Takeaways\n\n`
  note.key_takeaways.forEach((takeaway) => {
    markdown += `- ${takeaway}\n`
  })
  markdown += `\n`

  // Action Items
  if (actions.length > 0) {
    markdown += `## Action Items\n\n`
    actions.forEach((action) => {
      const status = action.status === "done" ? "✅" : "⬜"
      const owner = action.owner ? ` (${action.owner})` : ""
      const dueDate = action.due_date ? ` - Due: ${action.due_date}` : ""
      const priority = action.priority.toUpperCase()

      markdown += `${status} **[${priority}]** ${action.title}${owner}${dueDate}\n`
    })
    markdown += `\n`
  }

  // Expert Observations
  markdown += `## Expert Observations (${expert.persona})\n\n`
  expert.observations.forEach((obs) => {
    markdown += `### ${obs.headline}\n\n${obs.detail}\n\n`
  })

  // Entities
  if (note.entities.people.length > 0 || note.entities.organizations.length > 0 || note.entities.products.length > 0) {
    markdown += `## Mentioned Entities\n\n`

    if (note.entities.people.length > 0) {
      markdown += `**People:** ${note.entities.people.join(", ")}\n\n`
    }

    if (note.entities.organizations.length > 0) {
      markdown += `**Organizations:** ${note.entities.organizations.join(", ")}\n\n`
    }

    if (note.entities.products.length > 0) {
      markdown += `**Products:** ${note.entities.products.join(", ")}\n\n`
    }
  }

  return markdown
}

export function exportToJSON(bundle: NoteBundle): string {
  return JSON.stringify(bundle, null, 2)
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function generateCalendarEvent(bundle: NoteBundle): string {
  const { note, actions } = bundle

  // Find the first action with a due date
  const actionWithDate = actions.find((action) => action.due_date)

  if (!actionWithDate) {
    throw new Error("No action items with due dates found")
  }

  const startDate = new Date(actionWithDate.due_date!)
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour later

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nocturne Notes//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${actionWithDate.title}`,
    `DESCRIPTION:${note.summary}`,
    `UID:${note.id}@nocturne-notes.app`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  return icsContent
}

export function generateEmailDraft(bundle: NoteBundle): string {
  const { note, actions } = bundle

  const subject = encodeURIComponent(note.title)
  const body = encodeURIComponent(
    `Hi,\n\nI wanted to share some insights from my recent notes:\n\n${note.summary}\n\nKey takeaways:\n${note.key_takeaways.map((t) => `• ${t}`).join("\n")}\n\n${actions.length > 0 ? `Action items:\n${actions.map((a) => `• ${a.title}${a.owner ? ` (${a.owner})` : ""}`).join("\n")}\n\n` : ""}Best regards`,
  )

  return `mailto:?subject=${subject}&body=${body}`
}
