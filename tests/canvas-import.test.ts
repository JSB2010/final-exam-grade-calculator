import assert from "node:assert/strict"
import { test } from "node:test"
import { onRequestPost } from "../functions/api/canvas/courses"
import { importCanvasCourses } from "../utils/canvas-api"
import { getCanvasCurrentScore } from "../utils/canvas-course-data"

const fakeToken = "synthetic-test-token"
const fakeHost = "school.instructure.com"
const origin = `https://${fakeHost}`
const request = (baseUrl = fakeHost) => new Request("https://finalscalc.example/api/canvas/courses", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ baseUrl, token: fakeToken }),
})

test("approved Canvas host imports only relevant data and follows its own courses pagination", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async (url: RequestInfo | URL, init?: RequestInit) => {
    assert.deepEqual(init?.headers, { Authorization: `Bearer ${fakeToken}`, Accept: "application/json" })
    assert.equal(init?.redirect, "error")
    assert.equal(init?.credentials, "omit")
    if (!String(url).endsWith("?page=2")) {
      return Response.json([{
        id: 1,
        name: "Algebra",
        account_id: 42,
        enrollments: [{ role: "StudentEnrollment", user_id: 77, computed_current_score: "86.5", grades: { other: "discard" } }],
      }], { headers: { Link: '</api/v1/courses?page=2>; rel="next"' } })
    }
    return Response.json([{ id: 2, name: "Biology", teacher: "discard" }])
  })
  const result = await onRequestPost({ request: request(), env: {} })
  assert.equal(result.status, 200)
  assert.equal(result.headers.get("cache-control"), "no-store")
  assert.deepEqual(await result.json(), {
    courses: [
      { id: 1, name: "Algebra", enrollments: [{ role: "StudentEnrollment", computed_current_score: 86.5, grades: {} }] },
      { id: 2, name: "Biology" },
    ],
  })
  assert.equal(upstream.mock.callCount(), 2)
  assert.equal(String(upstream.mock.calls[1].arguments[0]), `${origin}/api/v1/courses?page=2`)
})

test("proxy requires a standard Canvas host or an explicitly configured custom hostname", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () => Response.json([]))
  const custom = "canvas.school.example"
  assert.equal((await onRequestPost({ request: request(custom), env: {} })).status, 403)
  assert.equal(upstream.mock.callCount(), 0)
  assert.equal((await onRequestPost({ request: request(custom), env: { CANVAS_ALLOWED_HOSTS: custom } })).status, 200)
  assert.equal(upstream.mock.callCount(), 1)
})

test("neither errors nor unexpected pagination send details or make another request", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () =>
    Response.json([], { headers: { Link: '<https://other.school.example/api/v1/courses?page=2>; rel="next"' } }),
  )
  const result = await onRequestPost({ request: request(), env: {} })
  assert.equal(result.status, 502)
  assert.equal(upstream.mock.callCount(), 1)
  assert.deepEqual(await result.json(), { error: "Could not retrieve courses from Canvas." })
})

test("when Canvas rejects a token the browser does not retry it directly", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ error: "Canvas rejected the token.", code: "canvas_auth" }, { status: 401 }),
  )
  await assert.rejects(importCanvasCourses(origin, fakeToken), /Canvas rejected this token/)
  assert.equal(upstream.mock.callCount(), 1)
})

test("when the proxy is unavailable the browser can still import directly", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async (url: RequestInfo | URL) => {
    if (String(url) === "/api/canvas/courses") return new Response(null, { status: 404 })
    return Response.json([{ id: 1, name: "Algebra" }])
  })
  assert.equal((await importCanvasCourses(origin, fakeToken)).courses[0].name, "Algebra")
  assert.equal(upstream.mock.callCount(), 2)
})


test("Canvas import ignores final-only scores but preserves a real current zero", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({
    courses: [
      { id: 1, enrollments: [{ computed_final_score: 76, grades: { final_score: 76, current_score: null } }] },
      { id: 2, enrollments: [{ computed_current_score: 0, grades: { current_score: 80, final_score: 70 } }] },
      { id: 3, enrollments: [{ grades: { current_score: "0", final_score: 70 } }] },
      { id: 4, enrollments: [{ computed_current_score: " ", grades: { current_score: "92" } }] },
    ],
  }))

  const { courses } = await importCanvasCourses(origin, fakeToken)
  assert.deepEqual(courses.map(getCanvasCurrentScore), [undefined, 0, 0, 92])
  assert.equal(JSON.stringify(courses).includes("final_score"), false)
})
