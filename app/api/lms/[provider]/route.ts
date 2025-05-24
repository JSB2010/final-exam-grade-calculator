import { NextRequest, NextResponse } from "next/server"
import type { GradeClass, Assignment } from "@/types/grade-calculator"

export const runtime = "edge"

async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json()
}

async function fetchCanvasCourses(baseUrl: string, token: string) {
  let url = `${baseUrl}/api/v1/courses?enrollment_state=active&per_page=50`
  const courses: any[] = []

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`)
    }

    const data = await res.json()
    courses.push(...data)

    // Parse the Link header for the next page URL
    const linkHeader = res.headers.get("Link")
    const nextLinkMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)
    url = nextLinkMatch ? nextLinkMatch[1] : null
  }

  return courses
}

async function fetchCanvasAssignments(
  baseUrl: string,
  courseId: number,
  token: string
) {
  const url = `${baseUrl}/api/v1/courses/${courseId}/assignments?per_page=50`
  return fetchJson(url, token)
}

function mapCanvasAssignment(a: any): Assignment {
  return {
    id: String(a.id),
    name: a.name,
    score: typeof a.score === "number" ? a.score : 0,
    totalPoints: typeof a.points_possible === "number" ? a.points_possible : 100,
    weight: a.group?.group_weight ?? 0,
    date: a.due_at ? a.due_at.split("T")[0] : undefined,
  }
}

const colorPalette = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];

function mapCanvasCourse(course: any, assignments: any[], index: number): GradeClass {
  return {
    id: String(course.id),
    name: course.name,
    current: typeof course.grades?.current_score === "number" ? course.grades.current_score : 0,
    weight: 100,
    target: "A",
    color: colorPalette[index % colorPalette.length],
    credits: course.credits || undefined,
    assignments: assignments.map(mapCanvasAssignment),
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params
    const body = await req.json().catch(() => ({}))
    const token = body.token as string | undefined
    const baseUrl = (body.baseUrl as string | undefined) ||
      "https://kentdenver.instructure.com"

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    if (provider !== "canvas") {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 })
    }

    const courses = await fetchCanvasCourses(baseUrl, token)
    const results: GradeClass[] = []
    for (const course of courses) {
      try {
        const assignments = await fetchCanvasAssignments(baseUrl, course.id, token)
        results.push(mapCanvasCourse(course, assignments))
      } catch (_) {
        // ignore failing courses
      }
    }

    return NextResponse.json({ classes: results })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
