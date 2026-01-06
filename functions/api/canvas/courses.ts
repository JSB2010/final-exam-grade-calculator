export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request } = context
    const body = await request.json()
    const baseUrl = (body?.baseUrl || "").toString().trim().replace(/\/$/, "")
    const token = (body?.token || "").toString()

    if (!baseUrl || !token) {
      return new Response(JSON.stringify({ error: "Missing baseUrl or token" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    }

    let url = `${baseUrl}/api/v1/courses?enrollment_state=active&include[]=total_scores&include[]=enrollments&per_page=50`
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

function parseLinkHeader(header: string | null): string | null {
  if (!header) return null
  const parts = header.split(",")
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel=\"next\"/)
    if (match && match[1]) return match[1]
  }
  return null
}
