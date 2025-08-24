"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { SpeechState } from "./types"

export function useSpeech(lang = navigator.language || "en-US") {
  const [state, setState] = useState<SpeechState>({
    isSupported: false,
    isRecording: false,
    interim: "",
    finalText: "",
    error: null,
  })

  const recognitionRef = useRef<any>(null)
  const finalTextRef = useRef("")
  const isStartingRef = useRef(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: false }))
      return
    }

    setState((prev) => ({ ...prev, isSupported: true }))

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      console.log("[v0] Speech recognition started successfully")
      isStartingRef.current = false
      setState((prev) => ({ ...prev, isRecording: true, error: null }))
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        finalTextRef.current = (finalTextRef.current + " " + finalTranscript).trim()
        setState((prev) => ({
          ...prev,
          finalText: finalTextRef.current,
          interim: interimTranscript.trim(),
        }))
      } else {
        setState((prev) => ({ ...prev, interim: interimTranscript.trim() }))
      }
    }

    recognition.onerror = (event: any) => {
      console.log("[v0] Speech recognition error:", event.error)
      isStartingRef.current = false

      if (event.error === "aborted") {
        setState((prev) => ({
          ...prev,
          error: "Recording was interrupted. This might be due to another tab using the microphone. Try again.",
          isRecording: false,
        }))
      } else if (event.error === "not-allowed") {
        setState((prev) => ({
          ...prev,
          error: "Microphone permission denied. Please allow microphone access and try again.",
          isRecording: false,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          error: `Recording error: ${event.error}`,
          isRecording: false,
        }))
      }
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      isStartingRef.current = false
      setState((prev) => ({ ...prev, isRecording: false }))
    }

    recognitionRef.current = recognition

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [lang])

  const start = useCallback(() => {
    if (!recognitionRef.current || state.isRecording || isStartingRef.current) return

    console.log("[v0] Starting speech recognition")
    isStartingRef.current = true
    finalTextRef.current = ""

    setState((prev) => ({
      ...prev,
      finalText: "",
      interim: "",
      error: null,
    }))

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.log("[v0] Failed to start speech recognition:", error)
      isStartingRef.current = false
      setState((prev) => ({
        ...prev,
        error: "Failed to start recording. Please try again.",
        isRecording: false,
      }))
    }
  }, [state.isRecording])

  const stop = useCallback(() => {
    if (!recognitionRef.current || !state.isRecording) return

    console.log("[v0] Stopping speech recognition")
    try {
      recognitionRef.current.stop()
    } catch (error) {
      console.log("[v0] Error stopping recognition:", error)
    }
  }, [state.isRecording])

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
    // Small delay before retrying to avoid immediate conflicts
    retryTimeoutRef.current = setTimeout(() => {
      start()
    }, 500)
  }, [start])

  return {
    ...state,
    start,
    stop,
    retry,
  }
}
