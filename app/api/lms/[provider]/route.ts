import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

function mapAssignment(a: any): Assignment {
  return {
    id: String(a.id),
    name: a.name,
    score: a.score ?? 0,
    totalPoints: a.points_possible ?? 100,
    weight: 0,
    date: a.due_at ? a.due_at.split("T")[0] : undefined
  }
}

function mapClass(course: any, assignments: any[]): GradeClass {
  return {
    id: String(course.id),
    name: course.name,
    current: course.enrollments?.[0]?.computed_current_score ?? 0,
    weight: 100,
    target: "A",
    color: "bg-blue-500",
    credits: course.credits,
    assignments: assignments.map(mapAssignment)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params
    if (provider !== "canvas") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const token = body.token as string | undefined
    const baseUrl = (body.url as string | undefined)?.replace(/\/$/, "")
    if (!token || !baseUrl) {
      return NextResponse.json({ error: "Missing token or url" }, { status: 400 })
    }

    const headers = { Authorization: `Bearer ${token}` }
    const coursesRes = await fetch(
      `${baseUrl}/api/v1/courses?per_page=50&include[]=total_scores&enrollment_state=active`,
      { headers }
    )
    if (!coursesRes.ok) {
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: coursesRes.status })
    }
    const courses = await coursesRes.json()

    const classes: GradeClass[] = []
    for (const course of courses) {
      const assignmentsRes = await fetch(
        `${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=50`,
        { headers }
      )
      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : []
      classes.push(mapClass(course, assignments))
    }

    return NextResponse.json({ classes })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
