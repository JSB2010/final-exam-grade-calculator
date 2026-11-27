import { CanvasRequestError, readCanvasCoursePages } from "../../../utils/canvas-fetch"
import { validateCanvasBaseUrl } from "../../../utils/canvas-urls"

type CanvasContext = { request: Request; env: { CANVAS_ALLOWED_HOSTS?: string } }

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
})

export const onRequestPost = async ({ request, env }: CanvasContext) => {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase()
  if (type !== "application/json") return response({ error: "JSON request required." }, 415)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return response({ error: "Invalid JSON." }, 400)
  }
  if (!body || typeof body !== "object" || !("baseUrl" in body) || !("token" in body)
      || typeof body.baseUrl !== "string" || typeof body.token !== "string"
      || body.baseUrl.length > 2048 || body.token.length > 4096 || !body.token.trim()) {
    return response({ error: "A Canvas domain and access token are required." }, 400)
  }

  const allowHosts = ["*.instructure.com", ...(env.CANVAS_ALLOWED_HOSTS ?? "").split(",")]
  const publicUrl = validateCanvasBaseUrl(body.baseUrl)
  if (publicUrl.error) return response({ error: publicUrl.error }, 400)
  const { normalized, error } = validateCanvasBaseUrl(publicUrl.normalized, { allowHosts })
  if (error) return response({ error }, 403)

  try {
    return response(await readCanvasCoursePages(normalized, body.token.trim(), AbortSignal.timeout(12_000)))
  } catch (err) {
    if (err instanceof CanvasRequestError && (err.status === 401 || err.status === 403)) {
      return response({ error: "Canvas rejected the token.", code: "canvas_auth" }, err.status)
    }
    return response({ error: "Could not retrieve courses from Canvas." }, 502)
  }
}

export const onRequestGet = async () =>
  response({ message: "Use POST with a Canvas domain and token to import courses." })
