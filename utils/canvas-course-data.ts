type CanvasRecord = Record<string, unknown>

export type CanvasEnrollment = {
  type?: string
  role?: string
  computed_current_score?: number
  grades?: {
    current_score?: number
  }
}

export type CanvasCourse = {
  id: number
  name?: string
  course_code?: string
  enrollments?: CanvasEnrollment[]
}

const asRecord = (value: unknown): CanvasRecord =>
  typeof value === "object" && value !== null ? (value as CanvasRecord) : {}

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined

const asScore = (value: unknown): number | undefined => {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return undefined
  const score = Number(value)
  return Number.isFinite(score) ? score : undefined
}

export const sanitizeCanvasCourses = (input: unknown): CanvasCourse[] => {
  if (!Array.isArray(input)) throw new Error("Canvas returned an invalid course list.")
  return input.flatMap((item) => {
    const course = asRecord(item)
    if (typeof course.id !== "number" || !Number.isSafeInteger(course.id) || course.id <= 0) return []
    const enrollments = Array.isArray(course.enrollments)
      ? course.enrollments.map((item: unknown) => {
        const enrollment = asRecord(item)
        const grades = asRecord(enrollment.grades)
        return {
          type: asString(enrollment.type),
          role: asString(enrollment.role),
          computed_current_score: asScore(enrollment.computed_current_score),
          grades: {
            current_score: asScore(grades.current_score),
          },
        }
      })
      : undefined
    return [{ id: course.id, name: asString(course.name), course_code: asString(course.course_code), enrollments }]
  })
}

export const pickStudentEnrollment = (enrollments?: CanvasEnrollment[]): CanvasEnrollment | undefined => {
  if (!enrollments?.length) return undefined
  const student = enrollments.find((enrollment) =>
    (enrollment.type ?? "").toLowerCase().includes("student") || (enrollment.role ?? "").toLowerCase().includes("student"),
  )
  return student ?? enrollments.find((enrollment) => !enrollment.type && !enrollment.role)
}

// Canvas final scores can treat ungraded work as zero. They are not pre-exam grades.
export const getCanvasCurrentScore = (course: CanvasCourse): number | undefined => {
  const enrollment = pickStudentEnrollment(course.enrollments)
  return enrollment?.computed_current_score ?? enrollment?.grades?.current_score
}
