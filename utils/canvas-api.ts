export type CanvasEnrollment = {
  type?: string
  role?: string
  computed_current_score?: number
  computed_final_score?: number
  grades?: {
    current_score?: number
    final_score?: number
  }
}

export type CanvasCourse = {
  id: number
  name: string
  course_code?: string
  workflow_state?: string
  enrollments?: CanvasEnrollment[]
  term?: {
    name?: string
    id?: number
  }
}

export type CanvasFetchResult = {
  courses: CanvasCourse[]
}

const MAX_PAGES = 4

const parseLinkHeader = (header: string | null): string | null => {
  if (!header) return null
  const parts = header.split(",")
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

export const normalizeCanvasBaseUrl = (raw: string): string => {
  if (!raw) return ""
  const trimmed = raw.trim().replace(/\/$/, "")
  if (!trimmed) return ""
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://${trimmed}`
}

export const fetchCanvasCourses = async (
  baseUrl: string,
  token: string,
  abortSignal?: AbortSignal,
): Promise<CanvasFetchResult> => {
  const normalizedBase = normalizeCanvasBaseUrl(baseUrl)
  if (!normalizedBase) {
    throw new Error("Canvas base URL is required")
  }
  if (!token) {
    throw new Error("Canvas token is required")
  }

  let url = `${normalizedBase}/api/v1/courses?enrollment_state=active&include[]=total_scores&include[]=enrollments&per_page=50`
  const courses: CanvasCourse[] = []
  let page = 0

  while (url && page < MAX_PAGES) {
    page += 1
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: abortSignal,
      credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      throw new Error(`Canvas request failed (${response.status}): ${errorText || response.statusText}`)
    }

    const pageCourses = (await response.json()) as CanvasCourse[]
    courses.push(...pageCourses)
    url = parseLinkHeader(response.headers.get("link"))
  }

  return { courses }
}

export const pickStudentEnrollment = (enrollments?: CanvasEnrollment[]): CanvasEnrollment | undefined => {
  if (!enrollments || enrollments.length === 0) return undefined
  const studentEnrollment = enrollments.find((enrollment) =>
    (enrollment.type ?? "").toLowerCase().includes("student") || (enrollment.role ?? "").toLowerCase().includes("student"),
  )
  return studentEnrollment ?? enrollments[0]
}

export const fetchCanvasCoursesProxy = async (
  baseUrl: string,
  token: string,
  abortSignal?: AbortSignal,
): Promise<CanvasFetchResult> => {
  const proxyEndpoint = typeof window !== "undefined" && (window as any).NEXT_PUBLIC_CANVAS_PROXY_URL
    ? (window as any).NEXT_PUBLIC_CANVAS_PROXY_URL
    : "/api/canvas/courses"
  const response = await fetch(proxyEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, token }),
    signal: abortSignal,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || `Proxy request failed (${response.status})`)
  }
  return (await response.json()) as CanvasFetchResult
}
