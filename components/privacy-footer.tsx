"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function PrivacyFooter() {
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <>
      <footer className="border-t border-white/6 bg-[#0B0C10]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Button
                variant="link"
                onClick={() => setShowPrivacy(true)}
                className="text-zinc-300 hover:text-zinc-100 p-0 h-auto text-xs sm:text-sm"
              >
                Privacy & Terms
              </Button>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs leading-relaxed">For informational purposes; not medical/legal advice</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Audio processed locally</span>
            </div>
          </div>
        </div>
      </footer>

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="bg-[#121318] border-white/6 max-w-2xl mx-4 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Privacy & Terms</DialogTitle>
            <DialogDescription className="text-zinc-300">How Nocturne Notes handles your data</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-zinc-300 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="font-medium text-zinc-200 mb-2">Data Processing</h3>
              <p>
                Audio is processed locally for transcription via your browser's built-in speech recognition. We send
                text transcripts to Gemini AI to structure your notes. You control what you share.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-zinc-200 mb-2">Local Storage</h3>
              <p>
                Your notes are stored locally in your browser using IndexedDB. This data remains on your device and is
                not transmitted to our servers unless you explicitly export or share it.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-zinc-200 mb-2">AI Processing</h3>
              <p>
                Text transcripts are sent to Google's Gemini AI service for structuring and analysis. Please review
                Google's privacy policy for information about how they handle this data.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-zinc-200 mb-2">Disclaimer</h3>
              <p>
                Nocturne Notes is for informational purposes only. The AI-generated insights and observations should not
                be considered medical, legal, or professional advice. Always consult qualified professionals for
                important decisions.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setShowPrivacy(false)}
              className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
