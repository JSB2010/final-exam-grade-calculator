const CANVAS_COURSES_PATH = "/api/v1/courses"
const CANVAS_COURSES_QUERY = "enrollment_state=active&include[]=total_scores&include[]=enrollments&per_page=50"

const publicHostname = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/

const isAllowedHost = (hostname: string, allowHosts: string[]): boolean => {
  return allowHosts.some((entry) => {
    const allowed = entry.trim().toLowerCase()
    // Bare names match exactly; subdomains require an explicit wildcard.
    return allowed.startsWith("*.")
      ? hostname.endsWith(allowed.slice(1))
      : hostname === allowed
  })
}

export const parseLinkHeader = (header: string | null): string | null => {
  if (!header) return null
  for (const match of header.matchAll(/<([^>]+)>([^<]*)/g)) {
    if (/;\s*rel\s*=\s*(?:"next"|next)(?=\s*(?:[;,]|$))/i.test(match[2])) return match[1]
  }
  return null
}

export const buildCanvasCoursesUrl = (baseUrl: string): string => {
  return `${baseUrl}${CANVAS_COURSES_PATH}?${CANVAS_COURSES_QUERY}`
}

export const getCanvasCoursesPageUrl = (link: string, current: string, origin: string): string => {
  const url = new URL(link, current)
  if (url.origin !== origin || url.pathname !== CANVAS_COURSES_PATH || url.username || url.password || url.hash) {
    throw new Error("Canvas returned an invalid course pagination URL.")
  }
  return url.href
}

export const validateCanvasBaseUrl = (
  raw: string,
  options?: { allowHosts?: string[] },
): { normalized: string; error?: string } => {
  const trimmed = raw.trim()
  if (!trimmed) return { normalized: "", error: "Canvas base URL is required." }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return { normalized: "", error: "Canvas base URL is invalid." }
  }

  if (url.protocol !== "https:") {
    return { normalized: "", error: "Canvas base URL must start with https://." }
  }
  if (url.username || url.password || url.port || !publicHostname.test(url.hostname)
      || /\.(localhost|local|internal)$/.test(url.hostname)) {
    return { normalized: "", error: "Enter a public Canvas domain without credentials or a custom port." }
  }
  if (options?.allowHosts && !isAllowedHost(url.hostname, options.allowHosts)) {
    return { normalized: "", error: "This Canvas domain is not enabled for proxy import." }
  }
  return { normalized: url.origin }
}

export const normalizeCanvasBaseUrl = (raw: string): string => {
  return validateCanvasBaseUrl(raw).normalized
}
