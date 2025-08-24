"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, Calendar, ExternalLink } from "lucide-react"

interface QuickActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: string
  onConfirm: () => void
}

export function QuickActionsDialog({ open, onOpenChange, action, onConfirm }: QuickActionsDialogProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  const getActionConfig = (action: string) => {
    switch (action) {
      case "email":
        return {
          title: "Draft Email",
          description: "Create an email draft with your note content",
          icon: <Mail className="h-6 w-6" />,
          successMessage: "Email draft created! Check your default email client.",
        }
      case "calendar":
        return {
          title: "Create Calendar Event",
          description: "Generate a calendar event from your action items",
          icon: <Calendar className="h-6 w-6" />,
          successMessage: "Calendar event file generated! Check your downloads.",
        }
      case "notion":
        return {
          title: "Send to Notion",
          description: "Export your structured note to Notion workspace",
          icon: <ExternalLink className="h-6 w-6" />,
          successMessage: "Successfully sent to Notion! Check your workspace.",
        }
      default:
        return {
          title: "Quick Action",
          description: "Perform quick action on your note",
          icon: <CheckCircle2 className="h-6 w-6" />,
          successMessage: "Action completed successfully!",
        }
    }
  }

  const config = getActionConfig(action)

  const handleConfirm = () => {
    onConfirm()
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121318] border-white/6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            {isSuccess ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : config.icon}
            {isSuccess ? "Success!" : config.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            {isSuccess ? config.successMessage : config.description}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              Confirm
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
