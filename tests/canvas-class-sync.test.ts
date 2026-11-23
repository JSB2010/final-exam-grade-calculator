import assert from "node:assert/strict"
import { test } from "node:test"
import type { GradeClass } from "../types/grade-calculator"
import { mergeCanvasClasses } from "../utils/canvas-class-sync"

const makeCourse = (overrides: Partial<GradeClass>): GradeClass => ({
  id: "existing",
  source: "canvas",
  canvasCourseId: 1,
  canvasCourseUrl: "https://school.instructure.com/courses/1",
  name: "Biology (edited)",
  current: 87,
  target: "A",
  weight: 30,
  assignments: [{ id: "lab", name: "Lab", score: 9, totalPoints: 10, weight: 12 }],
  color: "bg-green-500",
  credits: 4,
  lastSyncedAt: "2026-11-22T12:00:00Z",
  ...overrides,
})

test("Canvas sync is additive across a partial response and preserves edits and class order", () => {
  const matched = makeCourse({})
  const absent = makeCourse({
    id: "absent-older-course",
    canvasCourseId: 3,
    canvasCourseUrl: "https://school.instructure.com/courses/3",
  })
  const manual = makeCourse({ id: "manual", source: "manual", canvasCourseUrl: undefined })
  const otherSchool = makeCourse({
    id: "other-school",
    canvasCourseUrl: "https://other-school.instructure.com/courses/1",
  })
  const update = makeCourse({
    id: "new-generated-id",
    name: "Biology",
    current: 91,
    target: "B",
    weight: 20,
    assignments: [],
    color: "bg-blue-500",
    credits: 3,
    lastSyncedAt: "2026-11-23T12:00:00Z",
  })
  const added = makeCourse({
    id: "new-course",
    canvasCourseId: 2,
    canvasCourseUrl: "https://school.instructure.com/courses/2",
  })

  const existing = [absent, manual, matched, otherSchool]
  const incoming = [update, added]
  const merged = mergeCanvasClasses(existing, incoming)
  assert.deepEqual(merged, [
    absent,
    manual,
    { ...matched, current: 91, lastSyncedAt: update.lastSyncedAt },
    otherSchool,
    added,
  ])
  assert.equal(matched.current, 87)
  assert.deepEqual(mergeCanvasClasses(merged, incoming), merged)
  assert.deepEqual(mergeCanvasClasses(existing, []), existing)
})
