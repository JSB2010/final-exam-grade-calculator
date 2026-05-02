const CANVAS_COURSES_QUERY = "enrollment_state=active&include[]=total_scores&include[]=enrollments&per_page=50"

const isIpv4 = (hostname: string): boolean => {
  const parts = hostname.split(".")
  if (parts.length !== 4) return false
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false
    const value = Number(part)
    return value >= 0 && value <= 255
  })
}

const isPrivateIpv4 = (hostname: string): boolean => {
  if (!isIpv4(hostname)) return false
  const [a, b] = hostname.split(".").map(Number)
  if (a === 10) return true
  if (a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}

const isPrivateIpv6 = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase()
  if (normalized === "::1") return true
  if (normalized.startsWith("fe80:")) return true
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true
  return false
}

const isPrivateHostname = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase()
  if (normalized === "localhost" || normalized.endsWith(".localhost")) return true
  if (normalized === "0.0.0.0") return true
  if (isPrivateIpv4(normalized) || isPrivateIpv6(normalized)) return true
  return false
}

const normalizeAllowHosts = (allowHosts?: string[]): string[] => {
  if (!allowHosts) return []
  return allowHosts.map((host) => host.toLowerCase().trim()).filter(Boolean)
}

const isAllowedHost = (hostname: string, allowHosts: string[]): boolean => {
  if (allowHosts.length === 0) return true
  if (allowHosts.includes("*")) return true
  return allowHosts.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`))
}

export const parseLinkHeader = (header: string | null): string | null => {
  if (!header) return null
  const parts = header.split(",")
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/)
    if (match && match[1]) return match[1]
  }
  return null
}

export const buildCanvasCoursesUrl = (baseUrl: string): string => {
  return `${baseUrl}/api/v1/courses?${CANVAS_COURSES_QUERY}`
}

export const validateCanvasBaseUrl = (
  raw: string,
  options?: { allowHosts?: string[] },
): { normalized: string; error?: string } => {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { normalized: "", error: "Canvas base URL is required." }
  }

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

  if (isPrivateHostname(url.hostname)) {
    return { normalized: "", error: "Canvas base URL must be a public domain." }
  }

  const allowHosts = normalizeAllowHosts(options?.allowHosts)
  if (!isAllowedHost(url.hostname.toLowerCase(), allowHosts)) {
    return { normalized: "", error: "Canvas base URL is not in the allowed host list." }
  }

  return { normalized: url.origin }
}

export const normalizeCanvasBaseUrl = (raw: string): string => {
  return validateCanvasBaseUrl(raw).normalized
}
