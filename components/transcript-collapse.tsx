"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"

interface TranscriptCollapseProps {
  transcript: string
}

export function TranscriptCollapse({ transcript }: TranscriptCollapseProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-[#121318]/30 border-white/6">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-0 h-auto text-zinc-300 hover:text-zinc-100"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Source Transcript</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="p-4 rounded-lg bg-black/20 border border-white/6">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{transcript}</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
