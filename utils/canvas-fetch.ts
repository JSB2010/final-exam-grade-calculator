import { sanitizeCanvasCourses, type CanvasCourse } from "./canvas-course-data"
import { buildCanvasCoursesUrl, getCanvasCoursesPageUrl, parseLinkHeader } from "./canvas-urls"

const MAX_PAGES = 4

export class CanvasRequestError extends Error {
  constructor(message: string, readonly status: number, readonly reason?: "canvas_auth") {
    super(message)
  }
}

export const readCanvasCoursePages = async (origin: string, token: string, signal?: AbortSignal) => {
  let url: string | null = buildCanvasCoursesUrl(origin)
  const seen = new Set<string>()
  const courses = new Map<number, CanvasCourse>()

  while (url && seen.size < MAX_PAGES) {
    if (seen.has(url)) throw new Error("Canvas returned a repeated course page.")
    seen.add(url)
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal,
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
    })

    if (!res.ok) throw new CanvasRequestError(`Canvas request failed (${res.status}).`, res.status)
    for (const course of sanitizeCanvasCourses(await res.json())) courses.set(course.id, course)
    const next = parseLinkHeader(res.headers.get("link"))
    url = next ? getCanvasCoursesPageUrl(next, url, origin) : null
  }
  return { courses: [...courses.values()] }
}
