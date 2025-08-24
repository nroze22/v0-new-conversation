"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecordButtonProps {
  isRecording: boolean
  isProcessing?: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
  className?: string
}

export function RecordButton({
  isRecording,
  isProcessing = false,
  onStart,
  onStop,
  disabled = false,
  className,
}: RecordButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioLevelRef = useRef(0)

  // Simple waveform animation
  useEffect(() => {
    if (!isRecording || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      audioLevelRef.current = Math.random() * 0.8 + 0.2

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(80, 180, 255, 0.6)"

      // Draw simple bars
      const barCount = 8
      const barWidth = canvas.width / barCount

      for (let i = 0; i < barCount; i++) {
        const height = (Math.random() * audioLevelRef.current + 0.1) * canvas.height
        const x = i * barWidth + barWidth * 0.2
        const y = (canvas.height - height) / 2

        ctx.fillRect(x, y, barWidth * 0.6, height)
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [isRecording])

  const handleClick = () => {
    if (disabled || isProcessing) return

    if (isRecording) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        size="lg"
        className={cn(
          "relative h-16 w-16 rounded-full p-0 transition-all duration-200",
          "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600",
          "shadow-lg hover:shadow-xl",
          "border-2 border-blue-500/20",
          isRecording &&
            "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 ring-2 ring-red-500/50",
          isProcessing && "bg-gradient-to-br from-amber-600 to-amber-700",
          className,
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : isRecording ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}

        {/* Progress ring - simplified to avoid rapid updates */}
        {isRecording && (
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50%" cy="50%" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <circle
              cx="50%"
              cy="50%"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * 0.3}`}
              className="animate-pulse"
            />
          </svg>
        )}
      </Button>

      {/* Waveform canvas */}
      {isRecording && (
        <canvas
          ref={canvasRef}
          width={64}
          height={16}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded"
        />
      )}
    </div>
  )
}
