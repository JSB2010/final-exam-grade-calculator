import type { GradeClass } from "@/types/grade-calculator"

export function mergeCanvasClasses(existing: GradeClass[], incoming: GradeClass[]): GradeClass[] {
  const pending = new Map<string, GradeClass>()
  for (const course of incoming) {
    if (course.source === "canvas" && course.canvasCourseUrl) pending.set(course.canvasCourseUrl, course)
  }

  // Canvas only returns a window of courses. Absence is not a removal signal.
  const merged = existing.map((course) => {
    if (course.source !== "canvas" || !course.canvasCourseUrl) return course
    const update = pending.get(course.canvasCourseUrl)
    if (!update) return course
    pending.delete(course.canvasCourseUrl)
    return { ...course, current: update.current, lastSyncedAt: update.lastSyncedAt }
  })

  return [...merged, ...pending.values()]
}
