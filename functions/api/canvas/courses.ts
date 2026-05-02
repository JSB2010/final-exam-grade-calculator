import { buildCanvasCoursesUrl, parseLinkHeader, validateCanvasBaseUrl } from "../../../utils/canvas-urls"

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request } = context
    const body = await request.json()
    const baseUrl = (body?.baseUrl || "").toString()
    const token = (body?.token || "").toString().trim()
    const allowHostsEnv =
      typeof (context as any)?.env?.CANVAS_ALLOWED_HOSTS === "string"
        ? (context as any).env.CANVAS_ALLOWED_HOSTS
        : ""
    const allowHosts = allowHostsEnv
      ? allowHostsEnv.split(",").map((entry: string) => entry.trim()).filter(Boolean)
      : undefined
    const { normalized: normalizedBaseUrl, error: baseUrlError } = validateCanvasBaseUrl(baseUrl, { allowHosts })

    if (baseUrlError || !token) {
      return new Response(JSON.stringify({ error: baseUrlError || "Missing token" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }

    let url = buildCanvasCoursesUrl(normalizedBaseUrl)
    const courses: unknown[] = []
    let page = 0

    while (url && page < 4) {
      page += 1
      const res = await fetch(url, { headers })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        return new Response(
          JSON.stringify({ error: `Canvas request failed (${res.status})`, details: text || res.statusText }),
          { status: 502, headers: { "content-type": "application/json" } },
        )
      }
      const list = await res.json()
      if (Array.isArray(list)) courses.push(...list)
      const link = res.headers.get("link")
      const next = parseLinkHeader(link)
      url = next || ""
    }

    return new Response(JSON.stringify({ courses }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}

export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      message: "Use POST with JSON body { baseUrl, token } to fetch Canvas courses.",
      example: {
        baseUrl: "https://kentdenver.instructure.com",
        token: "<your-canvas-access-token>",
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  )
}
