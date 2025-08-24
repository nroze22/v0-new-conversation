"use client"

import { useState, useEffect } from "react"
import { useSpeech } from "@/lib/use-speech"
import { RecordButton } from "./record-button"
import { SpeechFallback } from "./speech-fallback"
import { Button } from "@/components/ui/button"
import { Zap, Mic } from "lucide-react"

interface RecordingInterfaceProps {
  onTranscriptComplete: (transcript: string) => void
  isProcessing?: boolean
}

export function RecordingInterface({ onTranscriptComplete, isProcessing = false }: RecordingInterfaceProps) {
  const speech = useSpeech()
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Demo transcript for testing
  const demoTranscript = `We had a great product brainstorming session today. The team discussed three main features for our new app: user authentication with social login, a dashboard with real-time analytics, and mobile push notifications. Sarah will handle the authentication system and aims to have it ready by next Friday. Mike is taking on the dashboard design and development, targeting completion by the end of next week. I need to research push notification services and present options to the team by Wednesday. We also identified that we need to conduct user interviews to validate our assumptions about the analytics features. The marketing team should be involved in defining the key metrics we want to track. Overall, everyone seemed excited about the direction we're heading.`

  const handleDemoNote = () => {
    setHasSubmitted(true)
    onTranscriptComplete(demoTranscript)
  }

  const handleStop = () => {
    speech.stop()
  }

  useEffect(() => {
    if (speech.isRecording) {
      setHasSubmitted(false)
    }
  }, [speech.isRecording])

  useEffect(() => {
    if (!speech.isRecording && speech.finalText.trim() && !hasSubmitted) {
      setHasSubmitted(true)
      onTranscriptComplete(speech.finalText)
    }
  }, [speech.isRecording, speech.finalText, onTranscriptComplete, hasSubmitted])

  if (!speech.isSupported) {
    return (
      <div className="space-y-6">
        <SpeechFallback onSubmit={onTranscriptComplete} isProcessing={isProcessing} />
        <div className="text-center">
          <Button
            onClick={handleDemoNote}
            variant="outline"
            className="gap-2 bg-background/50 border-border/50 hover:bg-accent/50"
            disabled={isProcessing}
          >
            <Zap className="h-4 w-4" />
            Try Demo Note
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {speech.isRecording ? (
            <>
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">Listening...</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {speech.finalText ? "Recording complete" : "Ready to record"}
              </span>
            </>
          )}
        </div>
        {speech.isRecording && (
          <Button
            onClick={handleStop}
            variant="outline"
            size="sm"
            className="h-8 px-3 bg-background/50 hover:bg-accent/50"
          >
            Stop
          </Button>
        )}
      </div>

      {/* Live Transcription Area */}
      <div className="min-h-[120px] sm:min-h-[150px] p-4 rounded-lg bg-background/30 border border-border/30">
        {!speech.isRecording && !speech.interim && !speech.finalText ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <Mic className="h-8 w-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground">Tap the microphone to start recording</p>
              <p className="text-xs text-muted-foreground/70">Your words will appear here as you speak</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Live interim text with typing effect */}
            {speech.interim && (
              <div className="relative">
                <p className="text-base sm:text-lg text-zinc-100 leading-relaxed">
                  {speech.interim}
                  <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 animate-pulse" />
                </p>
              </div>
            )}

            {/* Final confirmed text */}
            {speech.finalText && (
              <div className="border-t border-border/30 pt-3">
                <p className="text-base sm:text-lg text-white leading-relaxed font-medium">{speech.finalText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recording Tips */}
      {speech.isRecording && (
        <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-300 text-center">
            💡 Speak clearly and pause between thoughts for better accuracy
          </p>
        </div>
      )}

      {/* Record Button */}
      <div className="flex justify-center">
        <RecordButton
          isRecording={speech.isRecording}
          isProcessing={isProcessing}
          onStart={speech.start}
          onStop={handleStop}
          disabled={isProcessing}
        />
      </div>

      {/* Demo Button */}
      <div className="text-center">
        <Button
          onClick={handleDemoNote}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/50 border-border/50 hover:bg-accent/50"
          disabled={isProcessing || speech.isRecording}
        >
          <Zap className="h-4 w-4" />
          Try Demo Note
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md mx-auto px-4">
        <p className="leading-relaxed">
          Click the microphone to start recording your voice note. Your words will appear in real-time as you speak.
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          If recording fails, make sure no other browser tabs are using the microphone.
        </p>
      </div>
    </div>
  )
}
