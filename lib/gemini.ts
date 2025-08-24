export async function structureNote(transcript: string) {
  const response = await fetch("/api/gemini/structure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  })

  if (!response.ok) {
    throw new Error("Failed to structure note")
  }

  return response.json()
}

export async function extractActions(transcript: string, structured: any) {
  const response = await fetch("/api/gemini/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, structured }),
  })

  if (!response.ok) {
    throw new Error("Failed to extract actions")
  }

  return response.json()
}

export async function generateObservations(structured: any, actions: any[]) {
  const response = await fetch("/api/gemini/observations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structured, actions }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate observations")
  }

  return response.json()
}

export async function processTranscript(transcript: string) {
  try {
    console.log("[v0] Starting transcript processing:", transcript.slice(0, 100) + "...")

    // Step 1: Structure the note
    console.log("[v0] Calling structureNote...")
    const structured = await structureNote(transcript)
    console.log("[v0] Structured note result:", structured)

    // Step 2: Extract actions and generate observations in parallel
    console.log("[v0] Calling extractActions and generateObservations...")
    const [actionsResult, observationsResult] = await Promise.all([
      extractActions(transcript, structured),
      generateObservations(structured, []),
    ])
    console.log("[v0] Actions result:", actionsResult)
    console.log("[v0] Initial observations result:", observationsResult)

    // Step 3: Generate final observations with actions context
    console.log("[v0] Generating final observations...")
    const finalObservations = await generateObservations(structured, actionsResult.actions)
    console.log("[v0] Final observations result:", finalObservations)

    const result = {
      structured,
      actions: actionsResult.actions,
      observations: finalObservations,
    }

    console.log("[v0] Process transcript completed successfully")
    return result
  } catch (error) {
    console.error("[v0] Failed to process transcript:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw new Error(`Failed to process transcript: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
