import { z } from "zod"
import type { AppSettings, GradeClass } from "@/types/grade-calculator"

const STORAGE_VERSION = 1

const assignmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.coerce.number(),
  totalPoints: z.coerce.number(),
  weight: z.coerce.number(),
  date: z.string().optional(),
})

const gradeClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  current: z.coerce.number(),
  weight: z.coerce.number(),
  target: z.string(),
  assignments: z.array(assignmentSchema).default([]),
  color: z.string(),
  credits: z.coerce.number().optional(),
  source: z.enum(["manual", "canvas"]).optional(),
  canvasCourseId: z.coerce.number().optional(),
  canvasCourseUrl: z.string().optional(),
  lastSyncedAt: z.string().optional(),
})

const gradeClassesSchema = z.array(gradeClassSchema)

const appSettingsSchema = z.object({
  roundToWhole: z.boolean(),
  showDecimalPlaces: z.coerce.number().int().min(0).max(4),
  darkMode: z.boolean(),
  showCredits: z.boolean(),
  customGradeBands: z.boolean().optional(),
  gradingSystem: z.enum(["letter", "percentage", "gpa"]).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  studyReminderEnabled: z.boolean().optional(),
  autoSaveEnabled: z.boolean().optional(),
})

const themeSchema = z.enum(["light", "dark", "system"])

const gradeSnapshotSchema = z.object({
  id: z.string(),
  date: z.string(),
  classes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      grade: z.coerce.number(),
      color: z.string(),
    }),
  ),
})

const studySessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  classId: z.string(),
  date: z.coerce.date(),
  duration: z.coerce.number().int().nonnegative(),
  completed: z.boolean(),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
})

const gradeSnapshotsSchema = z.array(gradeSnapshotSchema)
const studySessionsSchema = z.array(studySessionSchema)

export type GradeSnapshot = z.infer<typeof gradeSnapshotSchema>
export type StudySession = z.infer<typeof studySessionSchema>

const sharePayloadSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  classes: gradeClassesSchema,
  settings: appSettingsSchema.optional(),
})

const parseWithFallback = <T>(schema: z.ZodType<T>, raw: unknown, fallback: T): T => {
  const parsed = schema.safeParse(raw)
  return parsed.success ? parsed.data : fallback
}

const parseVersioned = <T>(schema: z.ZodType<T>, raw: unknown, fallback: T): T => {
  if (raw && typeof raw === "object" && "version" in raw && "data" in raw) {
    const version = (raw as { version?: number }).version
    if (version === STORAGE_VERSION) {
      const data = (raw as { data?: unknown }).data
      return parseWithFallback(schema, data, fallback)
    }
    return fallback
  }

  return parseWithFallback(schema, raw, fallback)
}

const serializeVersioned = <T>(value: T): string => {
  return JSON.stringify({ version: STORAGE_VERSION, data: value })
}

export const parseGradeClasses = (raw: unknown, fallback: GradeClass[]): GradeClass[] => {
  return parseVersioned(gradeClassesSchema, raw, fallback)
}

export const serializeGradeClasses = (value: GradeClass[]): string => {
  return serializeVersioned(value)
}

export const parseAppSettings = (raw: unknown, fallback: AppSettings): AppSettings => {
  return parseVersioned(appSettingsSchema, raw, fallback)
}

export const serializeAppSettings = (value: AppSettings): string => {
  return serializeVersioned(value)
}

export const parseTheme = (raw: unknown, fallback: "light" | "dark" | "system"): "light" | "dark" | "system" => {
  return parseWithFallback(themeSchema, raw, fallback)
}

export const parseGradeSnapshots = (raw: unknown, fallback: GradeSnapshot[]): GradeSnapshot[] => {
  return parseWithFallback(gradeSnapshotsSchema, raw, fallback)
}

export const parseStudySessions = (raw: unknown, fallback: StudySession[]): StudySession[] => {
  return parseWithFallback(studySessionsSchema, raw, fallback)
}

export const parseSharePayload = (raw: unknown) => {
  return sharePayloadSchema.safeParse(raw)
}

export const STORAGE_VERSION_NUMBER = STORAGE_VERSION
