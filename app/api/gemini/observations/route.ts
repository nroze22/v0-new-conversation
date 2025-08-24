import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are Nocturne, a concise expert note-taker. Transform raw transcripts into clear notes, high-value action items, and expert observations. Be friendly, supportive, and authoritative. No hedging. Do not invent facts. Respond ONLY with valid JSON that matches the provided schema.

TASK: Choose best-fit persona. Return 2–4 observations (headline + 1-3 sentences each) with practical advice and pitfalls. Friendly-expert tone.

Available personas: Product Manager, Sales Coach, Fitness Coach, Clinical Ops PM, Parenting Coach

JSON Schema:
{
  "persona": "Product Manager|Sales Coach|Fitness Coach|Clinical Ops PM|Parenting Coach",
  "observations": [
    { "headline": "string", "detail": "string" }
  ]
}`

export async function POST(request: Request) {
  try {
    const { structured, actions } = await request.json()

    if (!structured || !actions) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    console.log("[v0] Observations API - GEMINI_API_KEY exists:", !!apiKey)

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    })

    const prompt = `${SYSTEM_PROMPT}

STRUCTURED NOTE:
${JSON.stringify(structured, null, 2)}

ACTION ITEMS:
${JSON.stringify(actions, null, 2)}

Choose the most appropriate persona and provide expert observations. Return JSON only.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let observationData
    try {
      observationData = JSON.parse(text)
    } catch (parseError) {
      // Retry once
      const retryPrompt = `${SYSTEM_PROMPT}

Based on this content, choose the best expert persona and provide 2-4 practical observations:

TOPIC: ${structured.topic}
TAGS: ${structured.tags?.join(", ")}
SUMMARY: ${structured.summary}

Return only valid JSON.`

      const retryResult = await model.generateContent(retryPrompt)
      const retryResponse = await retryResult.response
      const retryText = retryResponse.text()

      try {
        observationData = JSON.parse(retryText)
      } catch (retryParseError) {
        observationData = {
          persona: "Product Manager",
          observations: [
            {
              headline: "General Observation",
              detail: "Consider breaking down complex topics into smaller, actionable steps for better execution.",
            },
          ],
        }
      }
    }

    // Validate and sanitize observations
    const validPersonas = ["Product Manager", "Sales Coach", "Fitness Coach", "Clinical Ops PM", "Parenting Coach"]
    const sanitized = {
      persona: validPersonas.includes(observationData.persona) ? observationData.persona : "Product Manager",
      observations: Array.isArray(observationData.observations)
        ? observationData.observations.slice(0, 4).map((obs: any) => ({
            headline: String(obs.headline || "Key Insight"),
            detail: String(obs.detail || "Consider reviewing this area for improvement."),
          }))
        : [
            {
              headline: "Review Needed",
              detail: "This content would benefit from expert analysis and structured follow-up.",
            },
          ],
    }

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error("Gemini observations error:", error)
    return NextResponse.json({ error: "Failed to generate observations" }, { status: 500 })
  }
}
