import { sanitizeCanvasCourses } from "./canvas-course-data"
import { CanvasRequestError, readCanvasCoursePages } from "./canvas-fetch"
import { validateCanvasBaseUrl } from "./canvas-urls"

export { normalizeCanvasBaseUrl } from "./canvas-urls"
export { pickStudentEnrollment } from "./canvas-course-data"

const PROXY_PATH = "/api/canvas/courses"
const TIMEOUT_MS = 15_000

const optionalProxyUrl = () => {
  const configured = process.env.NEXT_PUBLIC_CANVAS_PROXY_URL
    || (typeof window === "undefined" ? undefined : (window as Window & { NEXT_PUBLIC_CANVAS_PROXY_URL?: string }).NEXT_PUBLIC_CANVAS_PROXY_URL)
  if (!configured) return PROXY_PATH
  const url = new URL(configured, window.location.origin)
  if (url.origin !== window.location.origin && url.protocol !== "https:") {
    throw new Error("The Canvas proxy must use HTTPS.")
  }
  if (url.username || url.password) throw new Error("The Canvas proxy URL is invalid.")
  return url.href
}

const timeout = (signal?: AbortSignal) => signal
  ? AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)])
  : AbortSignal.timeout(TIMEOUT_MS)

export const fetchCanvasCourses = async (baseUrl: string, token: string, abortSignal?: AbortSignal) => {
  const { normalized, error } = validateCanvasBaseUrl(baseUrl)
  if (!normalized || error) throw new Error(error || "A Canvas domain is required.")
  if (!token.trim()) throw new Error("A Canvas token is required.")
  return readCanvasCoursePages(normalized, token.trim(), timeout(abortSignal))
}

export const fetchCanvasCoursesProxy = async (baseUrl: string, token: string, abortSignal?: AbortSignal) => {
  const response = await fetch(optionalProxyUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, token }),
    signal: timeout(abortSignal),
    credentials: "omit",
    redirect: "error",
    cache: "no-store",
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const body: unknown = await response.json().catch(() => null)
      if (body && typeof body === "object" && "code" in body && body.code === "canvas_auth") {
        throw new CanvasRequestError("Canvas rejected this token. Check that it is current and belongs to this Canvas domain.", response.status, "canvas_auth")
      }
    }
    throw new CanvasRequestError("The Canvas import proxy could not complete the request.", response.status)
  }
  const data = await response.json()
  return { courses: sanitizeCanvasCourses(data?.courses) }
}

export const importCanvasCourses = async (baseUrl: string, token: string) => {
  try {
    return await fetchCanvasCoursesProxy(baseUrl, token)
  } catch (error) {
    if (error instanceof CanvasRequestError && error.reason === "canvas_auth") throw error
    try {
      return await fetchCanvasCourses(baseUrl, token)
    } catch (directError) {
      if (directError instanceof CanvasRequestError && (directError.status === 401 || directError.status === 403)) {
        throw new Error("Canvas rejected this token. Check that it is current and belongs to this Canvas domain.")
      }
      throw new Error("Could not connect to Canvas. Check your domain or enter your grades manually if your school blocks imports.")
    }
  }
}
