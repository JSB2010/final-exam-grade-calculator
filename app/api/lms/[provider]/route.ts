import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

// Map Canvas assignment into internal format
function mapCanvasAssignment(a: any): Assignment {
  return {
    id: String(a.id),
    name: a.name || "Assignment",
    score: 0,
    totalPoints: a.points_possible ?? 100,
    weight: 0,
    date: a.due_at ? a.due_at.split("T")[0] : undefined,
  }
}

// Map Canvas course and assignments into internal class format
function mapCanvasClass(c: any, assignments: any[]): GradeClass {
  return {
    id: String(c.id),
    name: c.name || "Class",
    current: c.enrollments?.[0]?.computed_current_score ?? 0,
    weight: 100,
    target: "A",
    color: "bg-blue-500",
    credits: undefined,
    assignments: assignments.map(mapCanvasAssignment),
  }
}

// Fetch courses from Canvas
async function getCanvasCourses(url: string, token: string) {
  const res = await fetch(`${url}/api/v1/courses?enrollment_state=active`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch courses")
  return res.json()
}

// Fetch assignments for a course
async function getCanvasAssignments(url: string, courseId: number, token: string) {
  const res = await fetch(
    `${url}/api/v1/courses/${courseId}/assignments?per_page=100`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  )
  if (!res.ok) throw new Error("Failed to fetch assignments")
  return res.json()
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params
    const body = await req.json().catch(() => ({}))

    if (provider !== "canvas") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    const url = body.url
    const token = body.token

    if (!url || !token) {
      return NextResponse.json({ error: "Missing url or token" }, { status: 400 })
    }

    const courses = await getCanvasCourses(url, token)
    const classes: GradeClass[] = []
    for (const course of courses) {
      const assignments = await getCanvasAssignments(url, course.id, token)
      classes.push(mapCanvasClass(course, assignments))
    }

    return NextResponse.json({ classes })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
