"use client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Zap } from "lucide-react"

type TargetGrade = {
  label: string
  cutoff: number
  required: number
  color: string
}

type GradeTimelineProps = {
  currentGrade: number
  finalWeight: number
  targetGrade: TargetGrade | null
  formatGrade: (grade: number) => string
}

export default function GradeTimeline({ currentGrade, finalWeight, targetGrade, formatGrade }: GradeTimelineProps) {
  // Calculate days until final exam (mock data)
  const daysUntilFinal = 21 // Example: 3 weeks until final

  // Calculate study hours recommendation based on gap between current and target
  const calculateStudyHours = () => {
    if (!targetGrade || targetGrade.required <= 0) return 0

    const gap = targetGrade.required - currentGrade
    if (gap <= 0) return 0

    // Simple formula: 1 hour per percentage point gap, adjusted by weight
    const baseHours = gap * (finalWeight / 100) * 2
    return Math.ceil(Math.min(Math.max(baseHours, 1), 8)) // Between 1-8 hours per day
  }

  const studyHoursPerDay = calculateStudyHours()

  // Calculate improvement needed per week
  const improvementPerWeek =
    daysUntilFinal > 0 && targetGrade && targetGrade.required > 0
      ? (targetGrade.required - currentGrade) / (daysUntilFinal / 7)
      : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span>Study Time</span>
              </div>
              <div className="text-2xl font-bold">
                {studyHoursPerDay} hrs<span className="text-sm font-normal">/day</span>
              </div>
            </div>
            <Badge variant="outline" className="font-normal">
              Recommended
            </Badge>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span>Final Exam</span>
              </div>
              <div className="text-2xl font-bold">
                {daysUntilFinal} <span className="text-sm font-normal">days left</span>
              </div>
            </div>
            <Badge variant="outline" className="font-normal">
              Countdown
            </Badge>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <Zap className="w-4 h-4" />
                <span>Weekly Goal</span>
              </div>
              <div className="text-2xl font-bold">
                +{formatGrade(Math.max(0, improvementPerWeek))}
                <span className="text-sm font-normal">%/week</span>
              </div>
            </div>
            <Badge variant="outline" className="font-normal">
              Improvement
            </Badge>
          </div>
        </Card>
      </div>

      <div className="relative pt-6">
        <div className="absolute top-0 left-0 right-0 flex justify-between text-sm text-muted-foreground px-4">
          <span>Today</span>
          <span>Final Exam</span>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: "0%" }}
          ></div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              1
            </div>
            <div>
              <h4 className="font-medium">Current Grade: {formatGrade(currentGrade)}%</h4>
              <p className="text-sm text-muted-foreground">Your starting point</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
              2
            </div>
            <div>
              <h4 className="font-medium">Study Plan: {studyHoursPerDay} hours per day</h4>
              <p className="text-sm text-muted-foreground">Consistent effort over {daysUntilFinal} days</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
              3
            </div>
            <div>
              <h4 className="font-medium">
                Target:{" "}
                {targetGrade ? `${targetGrade.label} (${formatGrade(targetGrade.required)}% on final)` : "None set"}
              </h4>
              <p className="text-sm text-muted-foreground">Your goal for the final exam</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
