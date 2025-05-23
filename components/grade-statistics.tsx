"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, Award, AlertTriangle, Calculator } from "lucide-react"
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

interface GradeStatisticsProps {
  classes: GradeClass[]
  gradeBands: GradeBand[]
  formatGrade: (grade: number) => string
}

export default function GradeStatistics({ classes, gradeBands, formatGrade }: GradeStatisticsProps) {
  const statistics = useMemo(() => {
    if (classes.length === 0) return null

    const grades = classes.map(cls => cls.current)
    const weights = classes.map(cls => cls.weight)

    // Basic statistics
    const mean = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
    const sortedGrades = [...grades].sort((a, b) => a - b)
    const median = sortedGrades.length % 2 === 0
      ? (sortedGrades[sortedGrades.length / 2 - 1] + sortedGrades[sortedGrades.length / 2]) / 2
      : sortedGrades[Math.floor(sortedGrades.length / 2)]

    const variance = grades.reduce((sum, grade) => sum + Math.pow(grade - mean, 2), 0) / grades.length
    const standardDeviation = Math.sqrt(variance)

    const min = Math.min(...grades)
    const max = Math.max(...grades)
    const range = max - min

    // Weighted average
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    const weightedAverage = totalWeight > 0
      ? grades.reduce((sum, grade, index) => sum + grade * weights[index], 0) / totalWeight
      : mean

    // Grade distribution
    const distribution = gradeBands.map(band => {
      const count = grades.filter(grade => {
        const nextBand = gradeBands.find(b => b.cutoff > band.cutoff)
        return grade >= band.cutoff && (nextBand ? grade < nextBand.cutoff : true)
      }).length
      return {
        ...band,
        count,
        percentage: (count / grades.length) * 100
      }
    }).filter(band => band.count > 0)

    // Risk analysis
    const atRiskClasses = classes.filter(cls => cls.current < 70).length
    const excellentClasses = classes.filter(cls => cls.current >= 90).length
    const averageClasses = classes.filter(cls => cls.current >= 70 && cls.current < 90).length

    // Target analysis
    const targetAnalysis = classes.map(cls => {
      const targetBand = gradeBands.find(band => band.label === cls.target)
      if (!targetBand) return null

      const currentBand = gradeBands.find(band => cls.current >= band.cutoff) || gradeBands[gradeBands.length - 1]
      const isOnTrack = cls.current >= targetBand.cutoff
      const gap = targetBand.cutoff - cls.current

      return {
        class: cls,
        targetBand,
        currentBand,
        isOnTrack,
        gap: Math.max(0, gap)
      }
    }).filter(Boolean)

    const onTrackCount = targetAnalysis.filter(t => t?.isOnTrack).length
    const needsImprovementCount = targetAnalysis.filter(t => !t?.isOnTrack).length

    return {
      basic: {
        mean,
        median,
        standardDeviation,
        min,
        max,
        range,
        weightedAverage
      },
      distribution,
      risk: {
        atRiskClasses,
        excellentClasses,
        averageClasses
      },
      targets: {
        onTrackCount,
        needsImprovementCount,
        analysis: targetAnalysis
      }
    }
  }, [classes, gradeBands])

  if (!statistics || classes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          <BarChart3 className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Add some classes to view grade statistics</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Grade Statistics & Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of your academic performance across all classes.
          </p>
        </CardHeader>
      </Card>

      {/* Basic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-2xl font-bold">{formatGrade(statistics.basic.mean)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Mean of all current grades</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Median Grade</p>
                <p className="text-2xl font-bold">{formatGrade(statistics.basic.median)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Middle value when sorted</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Grade</p>
                <p className="text-2xl font-bold">{formatGrade(statistics.basic.max)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Your best performing class</p>
              </div>
              <Award className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Grade Spread</p>
                <p className="text-2xl font-bold">{formatGrade(statistics.basic.standardDeviation)}</p>
                <p className="text-xs text-muted-foreground mt-1">How much grades vary</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Grade Distribution
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Shows how your classes are distributed across different letter grades.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.distribution.map((band) => (
              <div key={band.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${band.color}`}></div>
                    <span className="font-medium">{band.label}</span>
                    <span className="text-sm text-muted-foreground">({band.cutoff}%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{band.count} classes</span>
                    <Badge variant="outline">{formatGrade(band.percentage)}%</Badge>
                  </div>
                </div>
                <Progress value={band.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Categorizes your classes by performance level to identify areas needing attention.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {statistics.risk.atRiskClasses}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">At Risk (&lt;70%)</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.risk.averageClasses}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Average (70-89%)</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.risk.excellentClasses}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Excellent (90%+)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Achievement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Achievement
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Shows how many classes are on track to meet their target grades.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.targets.onTrackCount}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">On Track</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {statistics.targets.needsImprovementCount}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400">Needs Improvement</div>
              </div>
            </div>

            <div className="space-y-3">
              {statistics.targets.analysis.map((target) => (
                target && (
                  <div key={target.class.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${target.class.color}`}></div>
                      <div>
                        <div className="font-medium">{target.class.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {target.targetBand.label} | Current: {target.currentBand.label}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {target.isOnTrack ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          On Track
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          <Badge variant="secondary">
                            Need +{formatGrade(target.gap)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
