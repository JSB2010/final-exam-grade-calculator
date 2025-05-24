import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

export const runtime = "edge"

async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Request failed")
  return res.json()
}

function mapAssignment(a: any): Assignment {
  return {
    id: String(a.id),
    name: a.name || "Assignment",
    score: a.score ?? a.submission?.score ?? 0,
    totalPoints: a.totalPoints ?? a.points_possible ?? 100,
    weight: a.weight ?? 0,
    date: a.date || a.due_at,
  }
}

function mapClass(course: any, assignments: any[]): GradeClass {
  const score = course.enrollments?.[0]?.computed_current_score ?? 0
  return {
    id: String(course.id),
    name: course.name || "Course",
    current: typeof score === "number" ? score : 0,
    weight: 100,
    target: "A",
    color: "bg-blue-500",
    credits: course.credits || course.credit_hours,
    assignments: assignments.map(mapAssignment),
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } },
) {
  try {
    const { provider } = params
    const body = await req.json().catch(() => ({}))
    const token = body.token
    const baseUrl = (body.baseUrl as string | undefined)?.replace(/\/$/, "")

    if (provider !== "canvas" || !token || !baseUrl) {
      return NextResponse.json(
        { error: "Missing Canvas token or URL" },
        { status: 400 },
      )
    }

    const courses = await fetchJson(
      `${baseUrl}/api/v1/courses?enrollment_state=active`,
      token,
    )

    const classes: GradeClass[] = []

    for (const course of courses) {
      const assignmentsData = await fetchJson(
        `${baseUrl}/api/v1/courses/${course.id}/assignments?per_page=100`,
        token,
      ).catch(() => [])
      classes.push(mapClass(course, assignmentsData))
    }

    return NextResponse.json({ classes })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
