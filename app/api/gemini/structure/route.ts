import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are Nocturne, a concise expert note-taker. Transform raw transcripts into clear notes, high-value action items, and expert observations. Be friendly, supportive, and authoritative. No hedging. Do not invent facts. Respond ONLY with valid JSON that matches the provided schema.

TASK: Produce Structured Note JSON. Title ≤ 60 chars. 3–6 key_takeaways. 3–8 tags (mix of topic/project/person). Avoid hallucinations.

JSON Schema:
{
  "title": "string (<=60 chars)",
  "key_takeaways": ["string (3-6 bullets)"],
  "summary": "string (<=200 words)",
  "entities": {
    "people": ["string"],
    "organizations": ["string"],
    "products": ["string"]
  },
  "topic": "string",
  "tags": ["string (3-8 total, mix of topic/project/person)"]
}`

export async function POST(request: Request) {
  try {
    console.log("[v0] Structure API called")
    const { transcript } = await request.json()
    console.log("[v0] Received transcript:", transcript?.slice(0, 100) + "...")

    if (!transcript || typeof transcript !== "string") {
      console.log("[v0] Invalid transcript provided")
      return NextResponse.json({ error: "Invalid transcript" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    console.log("[v0] Environment variables check:")
    console.log("[v0] GEMINI_API_KEY exists:", !!apiKey)
    console.log("[v0] GEMINI_API_KEY length:", apiKey?.length || 0)
    console.log(
      "[v0] Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("GEMINI")),
    )

    if (!apiKey) {
      console.log("[v0] Gemini API key not configured")
      return NextResponse.json(
        {
          error: "Gemini API key not configured",
          debug: {
            hasKey: !!apiKey,
            availableGeminiVars: Object.keys(process.env).filter((key) => key.includes("GEMINI")),
          },
        },
        { status: 500 },
      )
    }

    console.log("[v0] Initializing Gemini model...")
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

Return Structured Note JSON only.`

    console.log("[v0] Sending request to Gemini...")
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log("[v0] Gemini response received:", text.slice(0, 200) + "...")

    let structuredNote
    try {
      structuredNote = JSON.parse(text)
      console.log("[v0] Successfully parsed JSON on first attempt")
    } catch (parseError) {
      console.log("[v0] First JSON parse failed, retrying...")
      // Retry once with explicit JSON instruction
      const retryPrompt = `${SYSTEM_PROMPT}

TRANSCRIPT:
${transcript}

Return only valid JSON matching the schema. No additional text or formatting.`

      const retryResult = await model.generateContent(retryPrompt)
      const retryResponse = await retryResult.response
      const retryText = retryResponse.text()
      console.log("[v0] Retry response received:", retryText.slice(0, 200) + "...")

      try {
        structuredNote = JSON.parse(retryText)
        console.log("[v0] Successfully parsed JSON on retry")
      } catch (retryParseError) {
        console.log("[v0] Both JSON parse attempts failed, using fallback")
        // Fallback structure
        structuredNote = {
          title: transcript.slice(0, 60) + (transcript.length > 60 ? "..." : ""),
          key_takeaways: ["Unable to process transcript automatically"],
          summary: transcript.slice(0, 200) + (transcript.length > 200 ? "..." : ""),
          entities: { people: [], organizations: [], products: [] },
          topic: "General",
          tags: ["unprocessed"],
        }
      }
    }

    // Validate and sanitize the response
    const sanitized = {
      title: String(structuredNote.title || "").slice(0, 60),
      key_takeaways: Array.isArray(structuredNote.key_takeaways)
        ? structuredNote.key_takeaways.slice(0, 6).map(String)
        : ["Unable to extract key takeaways"],
      summary: String(structuredNote.summary || "").slice(0, 400),
      entities: {
        people: Array.isArray(structuredNote.entities?.people)
          ? structuredNote.entities.people.slice(0, 10).map(String)
          : [],
        organizations: Array.isArray(structuredNote.entities?.organizations)
          ? structuredNote.entities.organizations.slice(0, 10).map(String)
          : [],
        products: Array.isArray(structuredNote.entities?.products)
          ? structuredNote.entities.products.slice(0, 10).map(String)
          : [],
      },
      topic: String(structuredNote.topic || "General"),
      tags: Array.isArray(structuredNote.tags) ? structuredNote.tags.slice(0, 8).map(String) : ["general"],
    }

    console.log("[v0] Returning sanitized result:", sanitized)
    return NextResponse.json(sanitized)
  } catch (error) {
    console.error("[v0] Gemini structure error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error details:", errorMessage)
    return NextResponse.json(
      {
        error: "Failed to structure note",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
