"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, TrendingUp, Target, BarChart3, Lightbulb, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface GradeClass {
  id: string
  name: string
  current: number
  weight: number
  target: string
  credits?: number
}

interface GradeBand {
  label: string
  cutoff: number
  color: string
}

interface EnhancedWhatIfProps {
  classes: GradeClass[]
  gradeBands: GradeBand[]
  formatGrade: (grade: number) => string
}

export default function EnhancedWhatIf({ classes, gradeBands, formatGrade }: Readonly<EnhancedWhatIfProps>) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "")
  const [targetGrade, setTargetGrade] = useState<string>("A")
  const [currentGradeAdjustment, setCurrentGradeAdjustment] = useState<number>(0)
  const [finalExamScore, setFinalExamScore] = useState<number>(85)
  const [scenarioType, setScenarioType] = useState<"target" | "improvement" | "risk">("target")

  const selectedClass = classes.find(cls => cls.id === selectedClassId)

  const calculateFinalGrade = (current: number, weight: number, finalScore: number) => {
    const currentWeight = (100 - weight) / 100
    const finalWeight = weight / 100
    return current * currentWeight + finalScore * finalWeight
  }

  const getCurrentGradeBand = (grade: number) => {
    for (const band of gradeBands) {
      if (grade >= band.cutoff) {
        return band
      }
    }
    return gradeBands[gradeBands.length - 1]
  }

  const calculateRequiredScore = (current: number, weight: number, targetCutoff: number) => {
    const currentWeight = (100 - weight) / 100
    const finalWeight = weight / 100
    return (targetCutoff - current * currentWeight) / finalWeight
  }

  const getDifficulty = (score: number) => {
    if (score > 95) return "Very Hard"
    if (score > 85) return "Hard"
    if (score > 70) return "Moderate"
    return "Easy"
  }

  const getRiskLevel = (grade: number) => {
    if (grade < 60) return "High Risk"
    if (grade < 70) return "Medium Risk"
    return "Low Risk"
  }

  const getRiskBadgeVariant = (risk: string) => {
    if (risk === "High Risk") return "destructive"
    if (risk === "Medium Risk") return "secondary"
    return "default"
  }

  const scenarios = useMemo(() => {
    if (!selectedClass) return []

    const adjustedCurrent = selectedClass.current + currentGradeAdjustment

    switch (scenarioType) {
      case "target": {
        const targetBand = gradeBands.find(band => band.label === targetGrade)
        if (!targetBand) return []

        const requiredScore = calculateRequiredScore(adjustedCurrent, selectedClass.weight, targetBand.cutoff)
        const finalGrade = calculateFinalGrade(adjustedCurrent, selectedClass.weight, finalExamScore)



        return [{
          type: "Target Achievement",
          description: `To achieve ${targetGrade} (${targetBand.cutoff}%+)`,
          requiredScore: Math.max(0, Math.min(100, requiredScore)),
          currentProjection: finalGrade,
          achievable: requiredScore <= 100,
          difficulty: getDifficulty(requiredScore)
        }]
      }

      case "improvement": {
        const improvementLevels = [5, 10, 15, 20]


        return improvementLevels.map(improvement => {
          const targetScore = adjustedCurrent + improvement
          const requiredScore = calculateRequiredScore(adjustedCurrent, selectedClass.weight, targetScore)
          return {
            type: "Grade Improvement",
            description: `Improve by ${improvement} points to ${formatGrade(targetScore)}%`,
            requiredScore: Math.max(0, Math.min(100, requiredScore)),
            currentProjection: calculateFinalGrade(adjustedCurrent, selectedClass.weight, finalExamScore),
            achievable: requiredScore <= 100,
            difficulty: getDifficulty(requiredScore)
          }
        })
      }

      case "risk": {
        const riskScores = [0, 30, 50, 70]
        return riskScores.map(score => {
          const finalGrade = calculateFinalGrade(adjustedCurrent, selectedClass.weight, score)
          const gradeBand = getCurrentGradeBand(finalGrade)
          return {
            type: "Risk Assessment",
            description: `If you score ${score}% on final`,
            requiredScore: score,
            currentProjection: finalGrade,
            achievable: true,
            difficulty: "N/A",
            gradeBand: gradeBand.label,
            risk: getRiskLevel(finalGrade)
          }
        })
      }

      default:
        return []
    }
  }, [selectedClass, targetGrade, currentGradeAdjustment, finalExamScore, scenarioType, gradeBands, formatGrade])

  const getScenarioColor = (scenario: any) => {
    if (scenario.type === "Risk Assessment") {
      if (scenario.risk === "High Risk") return "bg-red-100 border-red-300 dark:bg-red-900/20"
      if (scenario.risk === "Medium Risk") return "bg-amber-100 border-amber-300 dark:bg-amber-900/20"
      return "bg-green-100 border-green-300 dark:bg-green-900/20"
    }

    if (!scenario.achievable) return "bg-red-100 border-red-300 dark:bg-red-900/20"
    if (scenario.difficulty === "Very Hard") return "bg-orange-100 border-orange-300 dark:bg-orange-900/20"
    if (scenario.difficulty === "Hard") return "bg-amber-100 border-amber-300 dark:bg-amber-900/20"
    if (scenario.difficulty === "Moderate") return "bg-blue-100 border-blue-300 dark:bg-blue-900/20"
    return "bg-green-100 border-green-300 dark:bg-green-900/20"
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Very Hard": return <Zap className="h-4 w-4 text-red-500" />
      case "Hard": return <TrendingUp className="h-4 w-4 text-orange-500" />
      case "Moderate": return <Target className="h-4 w-4 text-blue-500" />
      case "Easy": return <Lightbulb className="h-4 w-4 text-green-500" />
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  if (classes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          <Calculator className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Classes Available</h3>
          <p className="text-muted-foreground">Add some classes to explore what-if scenarios</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            What-If Scenarios
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Explore different scenarios to understand what you need to achieve your goals or assess potential risks.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Type Explanation */}
          {scenarioType === "target" && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Target Achievement Analysis</p>
                <p className="mt-1">
                  Calculate exactly what you need to score on your final exam to achieve specific letter grades.
                  This helps you set realistic goals and plan your study strategy.
                </p>
              </div>
            </div>
          )}

          {scenarioType === "improvement" && (
            <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-300">
                <p className="font-medium">Grade Improvement Analysis</p>
                <p className="mt-1">
                  Explore how much you can improve your final grade with different final exam scores.
                  See the impact of various performance levels on your overall grade.
                </p>
              </div>
            </div>
          )}

          {scenarioType === "risk" && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-3 flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium">Risk Assessment Analysis</p>
                <p className="mt-1">
                  Understand the potential outcomes if you don't perform well on the final exam.
                  This helps you assess the minimum effort needed to maintain your desired grade.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-select">Select Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cls.color ?? 'bg-gray-400'}`}></div>
                        {cls.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario-type">Scenario Type</Label>
              <Select value={scenarioType} onValueChange={(value: any) => setScenarioType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="target">
                    <div className="flex flex-col">
                      <span>Target Achievement</span>
                      <span className="text-xs text-muted-foreground">Calculate what you need to reach a specific letter grade</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="improvement">
                    <div className="flex flex-col">
                      <span>Grade Improvement</span>
                      <span className="text-xs text-muted-foreground">See what's needed to improve by specific amounts</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="risk">
                    <div className="flex flex-col">
                      <span>Risk Assessment</span>
                      <span className="text-xs text-muted-foreground">Understand outcomes if you perform poorly on the final</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {scenarioType === "target" && (
            <div className="space-y-2">
              <Label htmlFor="target-grade">Target Grade</Label>
              <Select value={targetGrade} onValueChange={setTargetGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeBands.filter(band => band.cutoff > 0).map((band) => (
                    <SelectItem key={band.label} value={band.label}>
                      {band.label} ({band.cutoff}%+)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-adjustment">
              Current Grade Adjustment: {currentGradeAdjustment > 0 ? '+' : ''}{currentGradeAdjustment}%
            </Label>
            <p className="text-xs text-muted-foreground">
              Adjust your current grade to explore "what if" scenarios. For example, +5% if you expect to improve before the final.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[currentGradeAdjustment]}
                  onValueChange={(value) => setCurrentGradeAdjustment(value[0])}
                  min={-20}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>-20%</span>
                  <span>0%</span>
                  <span>+20%</span>
                </div>
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  value={currentGradeAdjustment}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    if (!isNaN(value)) {
                      setCurrentGradeAdjustment(Math.max(-20, Math.min(20, value)))
                    }
                  }}
                  min={-20}
                  max={20}
                  className="text-center"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {scenarioType !== "risk" && (
            <div className="space-y-2">
              <Label htmlFor="final-score">
                Final Exam Score: {finalExamScore}%
              </Label>
              <p className="text-xs text-muted-foreground">
                Set your expected final exam score to see your projected final grade.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[finalExamScore]}
                    onValueChange={(value) => setFinalExamScore(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    value={finalExamScore}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10)
                      if (!isNaN(value)) {
                        setFinalExamScore(Math.max(0, Math.min(100, value)))
                      }
                    }}
                    min={0}
                    max={100}
                    className="text-center"
                    placeholder="85"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <Card key={`${scenario.type}-${scenario.description}`} className={cn("border-2", getScenarioColor(scenario))}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getDifficultyIcon(scenario.difficulty)}
                  <h3 className="font-medium">{scenario.type}</h3>
                </div>
                {scenario.type !== "Risk Assessment" && (
                  <Badge variant={scenario.achievable ? "default" : "destructive"}>
                    {scenario.achievable ? "Achievable" : "Not Achievable"}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>

              <div className="space-y-2">
                {scenario.type === "Risk Assessment" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Final Grade:</span>
                      <span className="font-medium">{formatGrade(scenario.currentProjection)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Letter Grade:</span>
                      <span className="font-medium">{scenario.gradeBand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant={getRiskBadgeVariant(scenario.risk)}>
                        {scenario.risk}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Required Score:</span>
                      <span className="font-medium">
                        {scenario.achievable ? `${formatGrade(scenario.requiredScore)}%` : "Impossible"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Difficulty:</span>
                      <span className="font-medium">{scenario.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Projected Grade:</span>
                      <span className="font-medium">{formatGrade(scenario.currentProjection)}%</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
