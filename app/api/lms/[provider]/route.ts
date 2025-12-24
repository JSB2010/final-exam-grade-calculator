import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

export const runtime = "edge"

/**
 * Convert a raw assignment object into the application's normalized Assignment shape.
 *
 * @param a - Raw assignment object returned by the provider (may be partial)
 * @returns An Assignment with normalized fields: `id` (string, generated UUID if missing), `name` (default "Assignment"), `score` (numeric, default 0), `totalPoints` (numeric, default 100), `weight` (0), and `date` (ISO string or `undefined`)
 */
function mapAssignment(a: any): Assignment {
  return {
    id: String(a.id ?? crypto.randomUUID()),
    name: a.name || "Assignment",
    score: a.submission?.score ?? 0,
    totalPoints: a.points_possible ?? 100,
    weight: 0,
    date: a.due_at ?? undefined,
  }
}

/**
 * Convert a raw course-like object into a normalized GradeClass.
 *
 * @param c - Source object containing course data. Expected properties: `id` (any), `name` (string), `grades?.current_score` or `currentGrade` (number), `credits` (any), and `assignments` (array of assignment-like objects).
 * @returns A GradeClass with `id` as a string, `name`, `current` score, `weight`, `target`, `color`, `credits` copied from the source, and `assignments` as an array of mapped Assignment objects.
 */
function mapClass(c: any): GradeClass {
  return {
    id: String(c.id ?? crypto.randomUUID()),
    name: c.name || "Class",
    current: c.grades?.current_score ?? c.currentGrade ?? 0,
    weight: 0,
    target: "A",
    color: "bg-blue-500",
    credits: c.credits,
    assignments: Array.isArray(c.assignments) ? c.assignments.map(mapAssignment) : [],
  }
}

/**
 * Handles POST requests to fetch and transform Canvas course and assignment data into internal `GradeClass` objects.
 *
 * The request body must include `token` and `baseUrl`. If valid, the function fetches active courses from the Canvas API,
 * then fetches each course's assignments (including submissions), maps the results into `GradeClass` entries, and returns
 * a JSON object with a `classes` array.
 *
 * @param params.provider - The LMS provider identifier; only `"canvas"` is supported.
 * @returns A JSON response containing `{ classes: GradeClass[] }` on success, or `{ error: string }` with HTTP 400 for unsupported provider, missing input, or failed course fetch. 
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params
  if (provider !== "canvas") {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
  }

  const { token, baseUrl } = await req.json().catch(() => ({}))
  if (!token || !baseUrl) {
    return NextResponse.json({ error: "Missing token or baseUrl" }, { status: 400 })
  }

  const headers = { Authorization: `Bearer ${token}` }

  const coursesRes = await fetch(
    `${baseUrl}/api/v1/courses?enrollment_state=active`,
    { headers }
  )
  if (!coursesRes.ok) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 400 })
  }
  const courses = await coursesRes.json()

  const assignmentPromises = courses.map(async (course) => {
    const assignmentsRes = await fetch(
      `${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
      { headers }
    )
    const assignments = assignmentsRes.ok ? await assignmentsRes.json() : []
    return mapClass({ ...course, assignments })
  })

  const classes: GradeClass[] = await Promise.all(assignmentPromises)
  return NextResponse.json({ classes })
}