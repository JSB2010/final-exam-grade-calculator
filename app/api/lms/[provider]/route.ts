import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

export const runtime = "edge"

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

  const classes: GradeClass[] = []
  for (const course of courses) {
    const assignmentsRes = await fetch(
      `${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=100&include[]=submission`,
      { headers }
    )
    const assignments = assignmentsRes.ok ? await assignmentsRes.json() : []
    classes.push(mapClass({ ...course, assignments }))
  }

  return NextResponse.json({ classes })
}
