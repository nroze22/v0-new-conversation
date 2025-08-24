"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react"
import type { ActionItem, Priority } from "@/lib/types"

interface ActionListProps {
  actions: ActionItem[]
  onToggleAction?: (actionId: string) => void
  onUpdateAction?: (actionId: string, updates: Partial<ActionItem>) => void
  editable?: boolean
}

export function ActionList({ actions, onToggleAction, onUpdateAction, editable = false }: ActionListProps) {
  const [editingAction, setEditingAction] = useState<string | null>(null)

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "med":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
    }
  }

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-3 w-3" />
      case "med":
        return <AlertCircle className="h-3 w-3" />
      case "low":
        return <CheckCircle2 className="h-3 w-3" />
    }
  }

  if (actions.length === 0) {
    return (
      <Card className="bg-[#121318]/50 border-white/6">
        <CardContent className="p-6 text-center">
          <p className="text-zinc-400">No action items identified</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#121318]/50 border-white/6">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Action Items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`
              flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
              ${
                action.status === "done"
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-white/2 border-white/6 hover:border-white/12"
              }
            `}
          >
            <Checkbox
              checked={action.status === "done"}
              onCheckedChange={() => onToggleAction?.(action.id)}
              className="mt-0.5"
            />

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`
                  text-sm font-medium
                  ${action.status === "done" ? "text-zinc-400 line-through" : "text-zinc-200"}
                `}
                >
                  {action.title}
                </p>

                <Badge variant="outline" className={`text-xs ${getPriorityColor(action.priority)}`}>
                  {getPriorityIcon(action.priority)}
                  {action.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400">
                {action.owner && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{action.owner}</span>
                  </div>
                )}

                {action.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(action.due_date).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${action.confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(action.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
