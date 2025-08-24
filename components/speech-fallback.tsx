"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Type } from "lucide-react"

interface SpeechFallbackProps {
  onSubmit: (text: string) => void
  isProcessing?: boolean
}

export function SpeechFallback({ onSubmit, isProcessing = false }: SpeechFallbackProps) {
  const [text, setText] = useState("")

  const handleSubmit = () => {
    if (text.trim() && !isProcessing) {
      onSubmit(text.trim())
      setText("")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Speech Recognition Unavailable</span>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Type className="h-5 w-5" />
          Type Your Note Instead
        </CardTitle>
        <CardDescription>
          Your browser doesn't support speech recognition. You can still create structured notes by typing your content
          below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your note, meeting summary, or thoughts here..."
          className="min-h-32 resize-none bg-background/50 border-border/50 focus:border-blue-500/50"
          disabled={isProcessing}
        />
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? "Processing..." : "Create Structured Note"}
        </Button>
      </CardContent>
    </Card>
  )
}
