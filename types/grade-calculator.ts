export type GradeClass = {
  id: string
  name: string
  current: number
  weight: number
  target: string
  assignments: Assignment[]
  color: string
  credits?: number
  source?: "manual" | "canvas"
  canvasCourseId?: number
  canvasCourseUrl?: string
  lastSyncedAt?: string
}

export type Assignment = {
  id: string
  name: string
  score: number
  totalPoints: number
  weight: number
  date?: string
}

export type GradeBand = {
  label: string
  cutoff: number
  color: string
}

export type AppSettings = {
  roundToWhole: boolean
  showDecimalPlaces: number
  darkMode: boolean
  showCredits: boolean
  customGradeBands?: boolean
  gradingSystem?: "letter" | "percentage" | "gpa"
  theme?: "light" | "dark" | "system"
}

export type TargetGrade = GradeBand & {
  required: number
}

export type GradeTableData = GradeClass & {
  achievableGrades: (GradeBand & {
    required: number
  })[]
}

export type ExportFormat = "pdf" | "csv" | "png" | "json"

export type ExportOptions = {
  filename?: string
  title?: string
  includeCharts?: boolean
  includeDetails?: boolean
  format: ExportFormat
}
