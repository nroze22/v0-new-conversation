import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are Nocturne, a concise expert note-taker. Transform raw transcripts into clear notes, high-value action items, and expert observations. Be friendly, supportive, and authoritative. No hedging. Do not invent facts. Respond ONLY with valid JSON that matches the provided schema.

TASK: Extract crisp, user-doable action items. Imperative phrasing. Infer owner/due_date only if explicit; else null. Add confidence 0–1. Max 8 items.

JSON Schema:
{
  "actions": [
    {
      "title": "string (imperative verb first)",
      "owner": "string|null",
      "due_date": "YYYY-MM-DD|null",
      "priority": "low|med|high",
      "confidence": 0.0
    }
  ]
}`

export async function POST(request: Request) {
  try {
    const { transcript, structured } = await request.json()

    if (!transcript || !structured) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    console.log("[v0] Actions API - GEMINI_API_KEY exists:", !!apiKey)

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    })

    const prompt = `${SYSTEM_PROMPT}

TRANSCRIPT:
${transcript}

STRUCTURED NOTE:
${JSON.stringify(structured, null, 2)}

Extract action items and return JSON only.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let actionData
    try {
      actionData = JSON.parse(text)
    } catch (parseError) {
      // Retry once
      const retryPrompt = `${SYSTEM_PROMPT}

TRANSCRIPT:
${transcript}

Return only valid JSON with action items. No additional text.`

      const retryResult = await model.generateContent(retryPrompt)
      const retryResponse = await retryResult.response
      const retryText = retryResponse.text()

      try {
        actionData = JSON.parse(retryText)
      } catch (retryParseError) {
        actionData = { actions: [] }
      }
    }

    // Validate and sanitize actions
    const sanitizedActions = Array.isArray(actionData.actions)
      ? actionData.actions.slice(0, 8).map((action: any) => ({
          title: String(action.title || "Review and follow up"),
          owner: action.owner ? String(action.owner) : null,
          due_date: action.due_date && /^\d{4}-\d{2}-\d{2}$/.test(action.due_date) ? action.due_date : null,
          priority: ["low", "med", "high"].includes(action.priority) ? action.priority : "med",
          confidence: Math.max(0, Math.min(1, Number(action.confidence) || 0.5)),
        }))
      : []

    return NextResponse.json({ actions: sanitizedActions })
  } catch (error) {
    console.error("Gemini actions error:", error)
    return NextResponse.json({ error: "Failed to extract actions" }, { status: 500 })
  }
}
