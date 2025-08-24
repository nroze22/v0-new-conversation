"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, User, Dumbbell, Briefcase, Heart } from "lucide-react"
import type { ExpertObservation } from "@/lib/types"

interface ObservationsProps {
  observation: ExpertObservation
}

export function Observations({ observation }: ObservationsProps) {
  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case "Product Manager":
        return <Briefcase className="h-4 w-4" />
      case "Sales Coach":
        return <User className="h-4 w-4" />
      case "Fitness Coach":
        return <Dumbbell className="h-4 w-4" />
      case "Clinical Ops PM":
        return <Brain className="h-4 w-4" />
      case "Parenting Coach":
        return <Heart className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case "Product Manager":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Sales Coach":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "Fitness Coach":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "Clinical Ops PM":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "Parenting Coach":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30"
      default:
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
    }
  }

  return (
    <Card className="bg-[#121318]/50 border-white/6">
      <CardHeader>
        <CardTitle className="text-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Expert Observations
          </div>
          <Badge variant="outline" className={`text-xs ${getPersonaColor(observation.persona)}`}>
            {getPersonaIcon(observation.persona)}
            {observation.persona}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {observation.observations.map((obs, index) => (
          <div key={index} className="p-4 rounded-lg bg-white/2 border border-white/6">
            <h4 className="font-medium text-zinc-200 mb-2">{obs.headline}</h4>
            <p className="text-sm text-zinc-300 leading-relaxed">{obs.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
