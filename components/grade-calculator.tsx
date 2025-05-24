"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// Tooltips removed to fix infinite update loop
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  BookOpen,
  X,
  Plus,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  Settings,
  BarChart4,
  Target,
  Sparkles,
  Calculator,
  Lightbulb,
  Info,
  Table,
  TrendingUp,
  Award,
  Check,
  AlertCircle,
  Dices,
  Share2,
  FileDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import GradeChart from "@/components/grade-chart"
import GradeDistribution from "@/components/grade-distribution"
import GradeComparison from "@/components/grade-comparison"
import EnhancedWhatIf from "@/components/enhanced-what-if"
import GradeStatistics from "@/components/grade-statistics"
import { ExportDialog } from "@/components/export-dialog"
import { ShareDialog } from "@/components/share-dialog"
import { MobileOptimizations, TouchOptimizations } from "@/components/mobile-optimizations"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { exportToPdf } from "@/utils/export-utils"

// Define types
type GradeClass = {
  id: string
  name: string
  current: number
  weight: number
  target: string
  assignments: Assignment[]
  color: string
  credits?: number
}

type Assignment = {
  id: string
  name: string
  score: number
  totalPoints: number
  weight: number
  date?: string
}

type GradeBand = {
  label: string
  cutoff: number
  color: string
}

type AppSettings = {
  roundToWhole: boolean
  showDecimalPlaces: number
  darkMode: boolean
  showCredits: boolean
  customGradeBands?: boolean
  gradingSystem?: "letter" | "percentage" | "gpa"
  theme?: "light" | "dark" | "system"
  studyReminderEnabled?: boolean
  autoSaveEnabled?: boolean
}

/**
 * Renders the Grade Calculator application, providing a comprehensive interface for tracking classes, calculating grades, analyzing final exam requirements, and managing academic data.
 *
 * The component features multiple interactive tabs, including a grade calculator, insights dashboard, grade tables, what-if scenarios, statistics, and settings. Users can add and manage classes, set targets, view GPA, analyze grade distributions, and export or import their data. The app supports advanced features such as PDF report downloads, credit-weighted GPA, custom grade bands, and persistent local storage.
 *
 * @returns The Grade Calculator React component.
 *
 * @remarks All user data is stored locally in the browser. Export and import features are available for backup and transfer.
 */
export default function GradeCalculator() {
  const { toast } = useToast()
  const [classes, setClasses] = useLocalStorage<GradeClass[]>("grade-calculator-classes", [
    {
      id: "1",
      name: "Math",
      current: 85.75,
      weight: 30,
      target: "A",
      assignments: [],
      color: "bg-blue-500",
      credits: 4,
    },
    {
      id: "2",
      name: "Biology",
      current: 78.25,
      weight: 25,
      target: "B+",
      assignments: [],
      color: "bg-green-500",
      credits: 3,
    },
    {
      id: "3",
      name: "Global History",
      current: 92.5,
      weight: 20,
      target: "A",
      assignments: [],
      color: "bg-purple-500",
      credits: 3,
    },
    {
      id: "4",
      name: "Spanish",
      current: 88.25,
      weight: 15,
      target: "A-",
      assignments: [],
      color: "bg-amber-500",
      credits: 3,
    },
  ])

  const [settings, setSettings] = useLocalStorage<AppSettings>("grade-calculator-settings", {
    roundToWhole: true,
    showDecimalPlaces: 2,
    darkMode: false,
    showCredits: false,
    customGradeBands: false,
    gradingSystem: "letter",
    theme: "system",
    studyReminderEnabled: false,
    autoSaveEnabled: true
  })

  // Create a memoized function to update settings to prevent unnecessary re-renders
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }))
  }, [setSettings])

  const [showAdvanced, setShowAdvanced] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("calculator")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() =>
    classes.length > 0 ? classes[0].id : null,
  )
  const [lastInsightsClassId, setLastInsightsClassId] = useState<string | null>(null)

  // Custom function to handle class selection with synchronization
  const handleClassSelection = (classId: string | null) => {
    setSelectedClassId(classId)

    // If we're on insights tab and selecting a specific class, remember it
    if (activeTab === "insights" && classId && classId !== "all") {
      setLastInsightsClassId(classId)
    }
  }

  // Effect to handle tab switching and class synchronization
  useEffect(() => {
    if (activeTab === "insights") {
      // When switching to insights, restore the last insights class if available
      if (lastInsightsClassId && classes.find(cls => cls.id === lastInsightsClassId)) {
        setSelectedClassId(lastInsightsClassId)
      } else if (selectedClassId === "all" && classes.length > 0) {
        // If coming from "all" in tables, keep the first available class
        setSelectedClassId(classes[0].id)
      }
    } else if (activeTab === "tables") {
      // When switching to tables, if we have a specific class selected, keep it
      // If no class is selected, default to "all"
      if (!selectedClassId && classes.length > 0) {
        setSelectedClassId("all")
      }
    }
  }, [activeTab, classes, lastInsightsClassId, selectedClassId])

  const gradeBands: GradeBand[] = [
    { label: "A+", cutoff: 97, color: "bg-emerald-500" },
    { label: "A", cutoff: 93, color: "bg-emerald-400" },
    { label: "A−", cutoff: 90, color: "bg-green-500" },
    { label: "B+", cutoff: 87, color: "bg-green-400" },
    { label: "B", cutoff: 83, color: "bg-lime-500" },
    { label: "B−", cutoff: 80, color: "bg-lime-400" },
    { label: "C+", cutoff: 77, color: "bg-yellow-500" },
    { label: "C", cutoff: 73, color: "bg-yellow-400" },
    { label: "C−", cutoff: 70, color: "bg-amber-500" },
    { label: "D+", cutoff: 67, color: "bg-orange-500" },
    { label: "D", cutoff: 63, color: "bg-orange-400" },
    { label: "D−", cutoff: 60, color: "bg-red-400" },
    { label: "F", cutoff: 0, color: "bg-red-500" },
  ]

  const colorOptions = [
    { name: "Blue", value: "bg-blue-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Amber", value: "bg-amber-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Teal", value: "bg-teal-500" },
    { name: "Cyan", value: "bg-cyan-500" },
    { name: "Emerald", value: "bg-emerald-500" },
  ]

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  const formatGrade = (grade: number): string => {
    return grade.toFixed(settings.showDecimalPlaces)
  }

  // Special function for formatting final grades that applies rounding
  const formatFinalGrade = (grade: number): string => {
    if (settings.roundToWhole) {
      return Math.round(grade).toString()
    }
    return grade.toFixed(settings.showDecimalPlaces)
  }

  // Helper function to get color class based on grade band
  const getBandColorClass = (bandLabel: string): string => {
    if (bandLabel.startsWith("A")) return "text-emerald-600 dark:text-emerald-400"
    if (bandLabel.startsWith("B")) return "text-green-600 dark:text-green-400"
    if (bandLabel.startsWith("C")) return "text-amber-600 dark:text-amber-400"
    if (bandLabel.startsWith("D")) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  // Helper function to get background color class based on grade band
  const getBandBgColorClass = (bandLabel: string): string => {
    if (bandLabel.startsWith("A")) return "bg-emerald-500"
    if (bandLabel.startsWith("B")) return "bg-green-500"
    if (bandLabel.startsWith("C")) return "bg-amber-500"
    if (bandLabel.startsWith("D")) return "bg-orange-500"
    return "bg-red-500"
  }

  // Helper function to get color class based on final score
  const getFinalScoreColorClass = (score: number): string => {
    if (score === 100) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
    if (score >= 80) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    if (score >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  }

  // Helper function to get border color class based on final score
  const getFinalScoreBorderClass = (score: number): string => {
    if (score === 100) return "border-l-4 border-l-emerald-500"
    if (score >= 80) return "border-l-4 border-l-green-500"
    if (score >= 60) return "border-l-4 border-l-amber-500"
    return "border-l-4 border-l-red-500"
  }

  // Helper function to get target badge class
  const getTargetBadgeClass = (required: number): string => {
    if (required > 100) return "bg-red-500"
    if (required > 90) return "bg-amber-500"
    if (required > 70) return "bg-green-500"
    if (required === 0) return "bg-emerald-500"
    return "bg-blue-500"
  }

  // Helper function to get target badge text
  const getTargetBadgeText = (required: number): string => {
    if (required > 100) return "Impossible"
    if (required === 0) return "Already achieved"
    return `${formatGrade(required)}%`
  }

  // Helper function to get achievable class
  const getAchievableClass = (achievable: any): string => {
    if (!achievable) return "text-red-500"
    if (achievable.required > 90) return "text-amber-500 font-medium"
    if (achievable.required > 70) return "text-green-500 font-medium"
    return "text-blue-500 font-medium"
  }

  // Helper function to get achievable text
  const getAchievableText = (achievable: any): string => {
    if (!achievable) return "—"
    if (achievable.required === 0) return "✓"
    return `${formatGrade(achievable.required)}%`
  }

  const parseGrade = (value: string): number => {
    const parsed = Number.parseFloat(value)
    if (isNaN(parsed)) return 0
    return parsed
  }

  const handleGradeChange = (id: string, value: string) => {
    const numValue = parseGrade(value)
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, current: Math.min(Math.max(0, numValue), 100) } : cls)))
  }

  const handleNameChange = (id: string, value: string) => {
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, name: value } : cls)))
  }

  const handleWeightChange = (id: string, value: string) => {
    const numValue = parseGrade(value)
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, weight: Math.min(Math.max(0, numValue), 100) } : cls)))
  }

  const handleCreditsChange = (id: string, value: string) => {
    const numValue = Number.parseInt(value, 10)
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, credits: isNaN(numValue) ? 0 : numValue } : cls)))
  }

  const handleTargetChange = (id: string, value: string) => {
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, target: value } : cls)))
  }

  const handleColorChange = (id: string, value: string) => {
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, color: value } : cls)))
  }

  const handleRemove = (id: string) => {
    setClasses(classes.filter((cls) => cls.id !== id))
    toast({
      title: "Class removed",
      description: "The class has been removed from your calculator.",
    })
  }

  const handleAdd = () => {
    const newClass: GradeClass = {
      id: generateId(),
      name: "New Class",
      current: 80,
      weight: 20,
      target: "B",
      assignments: [],
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)].value,
      credits: 3,
    }
    setClasses([...classes, newClass])
    toast({
      title: "Class added",
      description: "A new class has been added to your calculator.",
    })
  }

  const handleAddAssignment = (classId: string) => {
    const newAssignment: Assignment = {
      id: generateId(),
      name: "Assignment " + (getClassById(classId)?.assignments.length + 1 || 1),
      score: 85,
      totalPoints: 100,
      weight: 10,
      date: new Date().toISOString().split("T")[0],
    }

    setClasses(
      classes.map((cls) => (cls.id === classId ? { ...cls, assignments: [...cls.assignments, newAssignment] } : cls)),
    )
  }

  const handleRemoveAssignment = (classId: string, assignmentId: string) => {
    setClasses(
      classes.map((cls) =>
        cls.id === classId
          ? {
              ...cls,
              assignments: cls.assignments.filter((a) => a.id !== assignmentId),
            }
          : cls,
      ),
    )
  }

  const handleAssignmentChange = (
    classId: string,
    assignmentId: string,
    field: keyof Assignment,
    value: string | number,
  ) => {
    setClasses(
      classes.map((cls) =>
        cls.id === classId
          ? {
              ...cls,
              assignments: cls.assignments.map((a) => (a.id === assignmentId ? { ...a, [field]: value } : a)),
            }
          : cls,
      ),
    )
  }

  // Fix the getClassById function to ensure it returns undefined when not found
  const getClassById = (id: string | null) => {
    if (!id) return undefined
    return classes.find((cls) => cls.id === id)
  }

  // Updated to account for rounding when settings.roundToWhole is true
  const calcRequiredRaw = (current: number, weight: number, cutoff: number) => {
    const w = weight / 100
    if (w <= 0) return Number.POSITIVE_INFINITY

    // If rounding is enabled, adjust the cutoff to account for rounding
    const adjustedCutoff = settings.roundToWhole ? cutoff - 0.5 : cutoff

    return (adjustedCutoff - (1 - w) * current) / w
  }

  const getRequiredGrades = (cls: GradeClass) => {
    return gradeBands
      .map((band) => ({
        ...band,
        raw: calcRequiredRaw(cls.current, cls.weight, band.cutoff),
      }))
      .filter((b) => b.raw <= 100)
  }

  // Fix the getTargetGrade function to handle undefined cases properly
  const getTargetGrade = (cls: GradeClass | undefined) => {
    if (!cls) return null

    const targetBand = gradeBands.find((band) => band.label === cls.target)
    if (!targetBand) return null

    const required = calcRequiredRaw(cls.current, cls.weight, targetBand.cutoff)
    return {
      ...targetBand,
      required: Math.ceil(Math.max(0, Math.min(100, required)) * 100) / 100,
    }
  }

  const getCurrentGradeBand = (grade: number) => {
    for (const band of gradeBands) {
      if (grade >= band.cutoff) {
        return band
      }
    }
    return gradeBands[gradeBands.length - 1] // F
  }

  const exportData = () => {
    const dataStr = JSON.stringify({ classes, settings }, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `grade-calculator-export-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Data exported",
      description: "Your grade data has been exported successfully.",
    })
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.classes && Array.isArray(importedData.classes)) {
          setClasses(importedData.classes)
          if (importedData.settings) {
            setSettings(importedData.settings)
          }
          toast({
            title: "Data imported",
            description: "Your grade data has been imported successfully.",
          })
        } else if (Array.isArray(importedData)) {
          // Support for older export format
          setClasses(importedData)
          toast({
            title: "Data imported",
            description: "Your grade data has been imported successfully.",
          })
        } else {
          throw new Error("Invalid data format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file contains invalid data.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the input value so the same file can be imported again if needed
    event.target.value = ""
  }

  const resetData = () => {
    setClasses([])
    toast({
      title: "Data reset",
      description: "All your grade data has been cleared.",
    })
  }

  const handleDownloadReport = async () => {
    if (!reportRef.current) {
      toast({
        title: "No report available",
        description: "There is no report to download at the moment.",
        variant: "destructive",
      })
      return
    }
    try {
      await exportToPdf(reportRef.current, {
        filename: "grade-report.pdf",
        title: "Grade Report",
      })
      toast({ title: "Report ready", description: "PDF downloaded." })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not generate PDF report.",
        variant: "destructive",
      })
    }
  }

  const calculateGPA = () => {
    const gradePoints: Record<string, number> = {
      "A+": 4.0,
      A: 4.0,
      "A−": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B−": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C−": 1.7,
      "D+": 1.3,
      D: 1.0,
      "D−": 0.7,
      F: 0.0,
    }

    if (!settings.showCredits) {
      // Simple average if not using credits
      let totalPoints = 0
      let totalClasses = 0

      classes.forEach((cls) => {
        const currentBand = getCurrentGradeBand(cls.current)
        if (currentBand && gradePoints[currentBand.label] !== undefined) {
          totalPoints += gradePoints[currentBand.label]
          totalClasses++
        }
      })

      return totalClasses > 0 ? (totalPoints / totalClasses).toFixed(2) : "0.00"
    } else {
      // Weighted by credits
      let totalPoints = 0
      let totalCredits = 0

      classes.forEach((cls) => {
        const currentBand = getCurrentGradeBand(cls.current)
        if (currentBand && gradePoints[currentBand.label] !== undefined && cls.credits) {
          totalPoints += gradePoints[currentBand.label] * cls.credits
          totalCredits += cls.credits
        }
      })

      return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"
    }
  }

  const getGradeStatus = (cls: GradeClass) => {
    const targetBand = gradeBands.find((band) => band.label === cls.target)

    if (!targetBand) return "unknown"

    if (cls.current >= targetBand.cutoff) {
      return "achieved"
    }

    const required = calcRequiredRaw(cls.current, cls.weight, targetBand.cutoff)
    if (required > 100) {
      return "impossible"
    }

    if (required <= 90) {
      return "likely"
    }

    return "challenging"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "achieved":
        return <Badge className="bg-emerald-500">Achieved</Badge>
      case "likely":
        return <Badge className="bg-blue-500">Likely</Badge>
      case "challenging":
        return <Badge className="bg-amber-500">Challenging</Badge>
      case "impossible":
        return <Badge className="bg-red-500">Impossible</Badge>
      default:
        return <Badge className="bg-slate-500">Unknown</Badge>
    }
  }

  const getTargetRequirementText = (cls: GradeClass | null) => {
    if (!cls) return "No class selected"
    const targetGrade = getTargetGrade(cls)
    if (!targetGrade) return "No target set"

    if (targetGrade.required > 100) {
      return "Not achievable"
    }
    return `Needs ${formatGrade(targetGrade.required)}% on final`
  }

  const renderInsightsContent = () => {
    if (classes.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Classes Added</h3>
            <p className="text-muted-foreground mb-4">Add your first class to start tracking your grades</p>
            <Button onClick={() => setActiveTab("calculator")} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Class
            </Button>
          </div>
        </Card>
      )
    }

    if (!selectedClassId) {
      return (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center">
            <Target className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Class</h3>
            <p className="text-muted-foreground">Choose a class from the dropdown to view detailed insights</p>
          </div>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="outline" className="font-medium">
                  Current
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1 truncate">
                {formatGrade(getClassById(selectedClassId)?.current ?? 0)}%
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {getCurrentGradeBand(getClassById(selectedClassId)?.current ?? 0).label} standing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                  <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <Badge variant="outline" className="font-medium">
                  Target
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1 truncate">{getClassById(selectedClassId)?.target ?? "None"}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {getTargetRequirementText(getClassById(selectedClassId))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="outline" className="font-medium">
                  Potential
                </Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1 truncate">
                {formatFinalGrade(
                  calculateFinalGrade(
                    getClassById(selectedClassId)?.current ?? 0,
                    getClassById(selectedClassId)?.weight ?? 0,
                    100,
                  ),
                )}
                %
              </h3>
              <p className="text-sm text-muted-foreground truncate">Maximum possible final grade</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Charts Grid - Responsive with equal heights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-md overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-medium">Grade Distribution</h3>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                <div className="flex-1 min-h-[280px] w-full overflow-hidden">
                  <GradeDistribution
                    currentGrade={getClassById(selectedClassId)?.current ?? 0}
                    targetGrade={getTargetGrade(getClassById(selectedClassId))}
                    gradeBands={gradeBands}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-medium">Final Exam Impact</h3>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                <div className="flex-1 min-h-[280px] w-full overflow-hidden">
                  <GradeChart
                    currentGrade={getClassById(selectedClassId)?.current ?? 0}
                    finalWeight={getClassById(selectedClassId)?.weight ?? 0}
                    gradeBands={gradeBands}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-medium">Grade Comparison</h3>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                <div className="flex-1 min-h-[280px] w-full overflow-hidden">
                  <GradeComparison
                    classes={classes}
                    selectedClassId={selectedClassId}
                    gradeBands={gradeBands}
                    formatGrade={formatGrade}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What-If Scenarios */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-medium">What-If Scenarios</h3>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[100, 90, 80, 70, 60, 0].map((finalScore) => {
                  const cls = getClassById(selectedClassId) as GradeClass
                  if (!cls) return null

                  const finalGrade = calculateFinalGrade(cls.current, cls.weight, finalScore)
                  const letterGrade = getCurrentGradeBand(finalGrade)

                  return (
                    <Card
                      key={finalScore}
                      className={cn(
                        "overflow-hidden transition-all hover:shadow-md",
                        getFinalScoreBorderClass(finalScore),
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              getFinalScoreColorClass(finalScore),
                            )}
                          >
                            {finalScore}% on Final
                          </Badge>
                          <Badge
                            className={cn(
                              getBandBgColorClass(letterGrade.label),
                            )}
                          >
                            {letterGrade.label}
                          </Badge>
                        </div>
                        <div className="text-center py-2">
                          <div className="text-3xl font-bold mb-1 truncate">{formatFinalGrade(finalGrade)}%</div>
                          <div className="text-sm text-muted-foreground">Final grade</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          <div className="flex justify-between">
                            <span className="truncate">Current: {formatGrade(cls.current)}%</span>
                            <span className="truncate">Final weight: {formatGrade(cls.weight)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("tables")
            }}
            className="flex items-center"
          >
            <Table className="w-4 h-4 mr-2" />
            View Detailed Grade Tables
          </Button>
        </div>
      </div>
    )
  }

  // Generate grade table data for all classes
  const gradeTableData = useMemo(() => {
    return classes.map((cls) => {
      const achievableGrades = gradeBands
        .filter((band) => {
          const required = calcRequiredRaw(cls.current, cls.weight, band.cutoff)
          return required <= 100
        })
        .map((band) => {
          const required = calcRequiredRaw(cls.current, cls.weight, band.cutoff)
          return {
            ...band,
            required: Math.max(0, required),
          }
        })
        .sort((a, b) => b.cutoff - a.cutoff)

      return {
        ...cls,
        achievableGrades,
      }
    })
  }, [classes, gradeBands, settings.roundToWhole])

  // Calculate final grade based on current grade, weight, and final exam score
  const calculateFinalGrade = (current: number, weight: number, finalScore: number) => {
    return current * (1 - weight / 100) + (finalScore * weight) / 100
  }

  // Single useEffect to handle resize events for charts
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return

    // Only trigger resize when on insights tab
    if (activeTab === "insights") {
      // Use a ref to track if we've already dispatched an event
      let hasDispatched = false;

      const timer = setTimeout(() => {
        if (!hasDispatched) {
          const event = new Event("resize")
          window.dispatchEvent(event)
          hasDispatched = true;
        }
      }, 200)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [activeTab, selectedClassId])

  return (
    <TouchOptimizations>
      <div className="space-y-6" ref={reportRef}>
        <MobileOptimizations />
        <Tabs defaultValue="calculator" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-6 w-auto">
            <TabsTrigger value="calculator" className="flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <BarChart4 className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-1">
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Tables</span>
            </TabsTrigger>
            <TabsTrigger value="what-if" className="flex items-center gap-1">
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">What-If</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart4 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <ExportDialog
              data={{ classes, settings }}
              trigger={
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              }
            />
            <ShareDialog
              data={{ classes, settings }}
              trigger={
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              }
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("import-file")?.click()}
              className="hidden sm:flex"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <input id="import-file" type="file" accept=".json" onChange={importData} className="hidden" aria-label="Import grade data" title="Import grade data" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all your classes and grade data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetData}>Reset Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <TabsContent value="calculator" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Your Classes</h2>
              <Badge variant="outline" className="font-normal">
                GPA: {calculateGPA()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="advanced-mode"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
              <Label htmlFor="advanced-mode" className="text-sm cursor-pointer">
                Advanced Mode
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {classes.map((cls, idx) => {
                const targetGrade = getTargetGrade(cls)
                const gradeStatus = getGradeStatus(cls)
                const currentBand = getCurrentGradeBand(cls.current)

                return (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Card
                      className="overflow-hidden border-t-4 transition-all duration-200 hover:shadow-md"
                      style={{ borderTopColor: cls.color.replace("bg-", "rgb(var(--") + "))" }}
                    >
                      <CardHeader className="p-4 pb-0 flex flex-row justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={cls.name}
                              onChange={(e) => handleNameChange(cls.id, e.target.value)}
                              className="text-lg font-semibold h-8 px-2 focus-visible:ring-1"
                            />
                            {getStatusBadge(gradeStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Current: {formatGrade(cls.current)}%</span>
                            <span>•</span>
                            <span>Final: {formatGrade(cls.weight)}%</span>
                            {settings.showCredits && <span>• {cls.credits} credits</span>}
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleRemove(cls.id)} className="h-8 w-8">
                          <X className="w-4 h-4" />
                        </Button>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`current-${cls.id}`}>Current Grade (%)</Label>
                              <div className="w-24">
                                <Input
                                  id={`current-${cls.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={cls.current}
                                  onChange={(e) => handleGradeChange(cls.id, e.target.value)}
                                  className="h-8 text-right"
                                />
                              </div>
                            </div>
                            <Slider
                              min={0}
                              max={100}
                              step={0.1}
                              value={[cls.current]}
                              onValueChange={(value) => handleGradeChange(cls.id, value[0].toString())}
                              className="py-1"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`weight-${cls.id}`}>Final Exam Weight (%)</Label>
                              <div className="w-24">
                                <Input
                                  id={`weight-${cls.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={cls.weight}
                                  onChange={(e) => handleWeightChange(cls.id, e.target.value)}
                                  className="h-8 text-right"
                                />
                              </div>
                            </div>
                            <Slider
                              min={0}
                              max={100}
                              step={0.1}
                              value={[cls.weight]}
                              onValueChange={(value) => handleWeightChange(cls.id, value[0].toString())}
                              className="py-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`target-${cls.id}`}>Target Grade</Label>
                              <Select value={cls.target} onValueChange={(value) => handleTargetChange(cls.id, value)}>
                                <SelectTrigger id={`target-${cls.id}`}>
                                  <SelectValue placeholder="Select target" />
                                </SelectTrigger>
                                <SelectContent>
                                  {gradeBands.map((band) => (
                                    <SelectItem key={band.label} value={band.label}>
                                      {band.label} ({band.cutoff}%)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`color-${cls.id}`}>Color</Label>
                              <Select value={cls.color} onValueChange={(value) => handleColorChange(cls.id, value)}>
                                <SelectTrigger id={`color-${cls.id}`}>
                                  <SelectValue placeholder="Select color">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full ${cls.color}`}></div>
                                      <span>{colorOptions.find((c) => c.value === cls.color)?.name}</span>
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {colorOptions.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                                        <span>{color.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {settings.showCredits && (
                            <div className="space-y-2">
                              <Label htmlFor={`credits-${cls.id}`}>Credits</Label>
                              <Input
                                id={`credits-${cls.id}`}
                                type="number"
                                min="0"
                                max="10"
                                step="1"
                                value={cls.credits ?? 0}
                                onChange={(e) => handleCreditsChange(cls.id, e.target.value)}
                                className="h-8"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex flex-col items-stretch">
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Current Standing</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                getBandColorClass(currentBand.label)
                              )}
                            >
                              {currentBand.label}
                            </Badge>
                          </div>

                          {targetGrade && (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">Needed for {targetGrade.label}</span>
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  className={cn(
                                    getTargetBadgeClass(targetGrade.required),
                                  )}
                                >
                                  {getTargetBadgeText(targetGrade.required)}
                                </Badge>
                                {targetGrade.required <= 100 && targetGrade.required > 0 && (
                                  targetGrade.required > 90 ? (
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-blue-500" />
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {showAdvanced && (
                          <div className="mt-2 pt-2 border-t">
                            <h4 className="text-sm font-medium mb-1">Required on Final:</h4>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                              {getRequiredGrades(cls)
                                .filter((b) => b.raw > 0 && b.raw <= 100)
                                .slice(0, 6)
                                .map((band) => (
                                  <Badge
                                    key={band.label}
                                    variant="outline"
                                    className="flex justify-between items-center"
                                  >
                                    <span>{band.label}:</span>
                                    <span>{formatGrade(band.raw)}%</span>
                                  </Badge>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  handleClassSelection(cls.id)
                                  setActiveTab("insights")
                                }}
                              >
                                <BarChart4 className="w-3.5 h-3.5 mr-1" />
                                View Analysis
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  handleClassSelection(cls.id)
                                  setActiveTab("tables")
                                }}
                              >
                                <Table className="w-3.5 h-3.5 mr-1" />
                                View Tables
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card
                className="flex items-center justify-center p-6 h-full border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={handleAdd}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                    <Plus className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="font-medium">Add Class</h3>
                  <p className="text-sm text-muted-foreground">Track another course</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Grade Insights</h2>
            <Select value={selectedClassId ?? ""} onValueChange={handleClassSelection} disabled={classes.length === 0}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderInsightsContent()}
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Grade Tables</h2>
            <Select value={selectedClassId ?? ""} onValueChange={handleClassSelection} disabled={classes.length === 0}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {classes.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Classes Added</h3>
                <p className="text-muted-foreground mb-4">Add some classes to see grade tables</p>
                <Button
                  onClick={() => {
                    handleAdd()
                    setActiveTab("calculator")
                  }}
                >
                  Add Your First Class
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {selectedClassId && getClassById(selectedClassId)
                        ? `${getClassById(selectedClassId)?.name} - `
                        : ""}
                      Required Final Exam Scores
                    </h3>
                    {settings.roundToWhole && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span className="text-xs">Accounts for rounding</span>
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Class</th>
                          <th className="px-4 py-3 text-left font-medium">Current</th>
                          <th className="px-4 py-3 text-left font-medium">Final Weight</th>
                          {gradeBands
                            .filter((band) => band.cutoff > 0)
                            .slice(0, 8)
                            .map((band) => (
                              <th
                                key={band.label}
                                className={cn(
                                  "px-4 py-3 text-center font-medium",
                                  getBandColorClass(band.label),
                                )}
                              >
                                {band.label}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gradeTableData
                          .filter((cls) => selectedClassId === "all" || !selectedClassId || cls.id === selectedClassId)
                          .map((cls) => (
                            <tr key={cls.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${cls.color}`}></div>
                                  <span className="font-medium">{cls.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">{formatGrade(cls.current)}%</td>
                              <td className="px-4 py-3">{formatGrade(cls.weight)}%</td>
                              {gradeBands
                                .filter((band) => band.cutoff > 0)
                                .slice(0, 8)
                                .map((band) => {
                                  const achievable = cls.achievableGrades.find((g) => g.label === band.label)
                                  return (
                                    <td
                                      key={band.label}
                                      className={cn(
                                        "px-4 py-3 text-center",
                                        getAchievableClass(achievable),
                                      )}
                                    >
                                      {getAchievableText(achievable)}
                                    </td>
                                  )
                                })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span>Easy (≤70%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Moderate (71-90%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-amber-500 rounded-full"></span>
                      <span>Challenging (91-100%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>Impossible ({">"}100%)</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <Card className="shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-lg font-medium">
                    {selectedClassId && getClassById(selectedClassId)
                      ? `${getClassById(selectedClassId)?.name} - `
                      : ""}
                    Final Grade Outcomes
                  </h3>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Class</th>
                          <th className="px-4 py-3 text-left font-medium">Current</th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-emerald-600 dark:text-emerald-400">Perfect</span>
                              <span className="text-xs text-muted-foreground">100% on Final</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-green-600 dark:text-green-400">Excellent</span>
                              <span className="text-xs text-muted-foreground">90% on Final</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-blue-600 dark:text-blue-400">Good</span>
                              <span className="text-xs text-muted-foreground">80% on Final</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-amber-600 dark:text-amber-400">Average</span>
                              <span className="text-xs text-muted-foreground">70% on Final</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-orange-600 dark:text-orange-400">Poor</span>
                              <span className="text-xs text-muted-foreground">60% on Final</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-center font-medium">
                            <div className="flex flex-col items-center">
                              <span className="text-red-600 dark:text-red-400">Fail</span>
                              <span className="text-xs text-muted-foreground">0% on Final</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeTableData
                          .filter((cls) => selectedClassId === "all" || !selectedClassId || cls.id === selectedClassId)
                          .map((cls) => (
                            <tr key={cls.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${cls.color}`}></div>
                                  <span className="font-medium">{cls.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span>{formatGrade(cls.current)}%</span>
                                  <span className="text-xs text-muted-foreground">
                                    {getCurrentGradeBand(cls.current).label}
                                  </span>
                                </div>
                              </td>
                              {[100, 90, 80, 70, 60, 0].map((score) => {
                                const finalGrade = calculateFinalGrade(cls.current, cls.weight, score)
                                const letterGrade = getCurrentGradeBand(finalGrade)
                                return (
                                  <td key={score} className="px-4 py-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <span
                                        className={cn(
                                          "font-medium",
                                          getBandColorClass(letterGrade.label),
                                        )}
                                      >
                                        {formatFinalGrade(finalGrade)}%
                                      </span>
                                      <span
                                        className={cn(
                                          "text-xs",
                                          getBandColorClass(letterGrade.label),
                                        )}
                                      >
                                        {letterGrade.label}
                                      </span>
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab("insights")
                  }}
                  className="flex items-center"
                >
                  <BarChart4 className="w-4 h-4 mr-2" />
                  View Detailed Insights
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="what-if" className="space-y-6">
          <EnhancedWhatIf
            classes={classes}
            gradeBands={gradeBands}
            formatGrade={formatGrade}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <GradeStatistics
            classes={classes}
            gradeBands={gradeBands}
            formatGrade={formatGrade}
          />
        </TabsContent>



        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Settings</h2>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-medium">Grade Display Settings</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="round-to-whole">Round Final Grades</Label>
                    <p className="text-sm text-muted-foreground">
                      Round only the final calculated grade to the nearest whole number (like on report cards)
                    </p>
                  </div>
                  <Switch
                    id="round-to-whole"
                    checked={settings.roundToWhole}
                    onCheckedChange={(checked) => updateSettings({ roundToWhole: checked })}
                  />
                </div>

                {settings.roundToWhole && (
                  <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">Final Grade Rounding Enabled</p>
                      <p className="mt-1">
                        Only your final calculated grade will be rounded to the nearest whole number, just like on report cards.
                        Current grades and intermediate calculations remain precise. For example, a final grade of 96.5% would
                        round up to 97%, potentially changing your letter grade from A to A+.
                      </p>
                    </div>
                  </div>
                )}

                {!settings.roundToWhole && (
                  <div className="space-y-2">
                    <Label htmlFor="decimal-places">Decimal Places</Label>
                    <div className="flex items-center gap-4">
                      <Select
                        value={settings.showDecimalPlaces.toString()}
                        onValueChange={(value) =>
                          setSettings({ ...settings, showDecimalPlaces: Number.parseInt(value, 10) })
                        }
                      >
                        <SelectTrigger id="decimal-places" className="w-[180px]">
                          <SelectValue placeholder="Select decimal places" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0 decimal places</SelectItem>
                          <SelectItem value="1">1 decimal place</SelectItem>
                          <SelectItem value="2">2 decimal places</SelectItem>
                          <SelectItem value="3">3 decimal places</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground">
                        Example: {(85.75).toFixed(settings.showDecimalPlaces)}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-credits">Show Credits</Label>
                    <p className="text-sm text-muted-foreground">
                      Track credit hours for each class and calculate weighted GPA
                    </p>
                  </div>
                  <Switch
                    id="show-credits"
                    checked={settings.showCredits}
                    onCheckedChange={(checked) => updateSettings({ showCredits: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grading-system">Grading System</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose how grades are displayed throughout the app
                    </p>
                  </div>
                  <Select
                    id="grading-system"
                    value={settings.gradingSystem ?? "letter"}
                    onValueChange={(value: "letter" | "percentage" | "gpa") =>
                      updateSettings({ gradingSystem: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select grading system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter Grades (A, B, C)</SelectItem>
                      <SelectItem value="percentage">Percentages (0-100%)</SelectItem>
                      <SelectItem value="gpa">GPA Scale (0.0-4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-medium">Feature Settings</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="study-reminders">Study Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable notifications for upcoming study sessions
                    </p>
                  </div>
                  <Switch
                    id="study-reminders"
                    checked={settings.studyReminderEnabled ?? false}
                    onCheckedChange={(checked) => updateSettings({ studyReminderEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto-Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes as you make them
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSaveEnabled ?? true}
                    onCheckedChange={(checked) => updateSettings({ autoSaveEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-grade-bands">Custom Grade Bands</Label>
                    <p className="text-sm text-muted-foreground">
                      Define your own custom grade bands and cutoffs
                    </p>
                  </div>
                  <Switch
                    id="custom-grade-bands"
                    checked={settings.customGradeBands ?? false}
                    onCheckedChange={(checked) => updateSettings({ customGradeBands: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-medium">Data Management</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <ExportDialog
                  data={{ classes, settings }}
                  trigger={
                    <Button className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  }
                />

                <ShareDialog
                  data={{ classes, settings }}
                  trigger={
                    <Button variant="outline" className="flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Data
                    </Button>
                  }
                />

                <Button variant="outline" className="flex items-center" onClick={handleDownloadReport}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Report
                </Button>

                <Button
                  variant="outline"
                  onClick={() => document.getElementById("import-file")?.click()}
                  className="flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your classes and grade data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetData}>Reset Data</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Your data is stored locally in your browser. Export your data to back it up or transfer to another
                  device.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <h3 className="text-lg font-medium">About</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="mb-2">
                  <strong>Grade Calculator</strong> helps you track your academic progress and calculate what you need
                  on your finals to achieve your target grades.
                </p>
                <p>
                  Features include grade tracking, final exam impact analysis, GPA calculation, and what-if scenarios to
                  help you plan your study strategy.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <div className="text-sm">
                  <p className="font-medium">Version 3.0</p>
                  <p className="text-muted-foreground">Last updated: May 22, 2025</p>
                </div>
                <Badge variant="outline">Stable Release</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
    </TouchOptimizations>
  )
}
