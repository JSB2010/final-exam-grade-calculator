import { strict as assert } from "node:assert"
import { test } from "node:test"
import {
  applyFinalGradeRounding,
  calculateFinalGrade,
  calculateRequiredScore,
  formatRequiredScore,
  getGradeBand,
} from "../utils/grade-math.ts"

const rounded = { roundToWhole: true }
const bands = [{ label: "A", cutoff: 93 }, { label: "A−", cutoff: 90 }]

test("a 92.50 current grade and 20% final weight need 92.50 for a rounded A, not 95", () => {
  const required = calculateRequiredScore(92.5, 20, 93, rounded)
  assert.equal(required, 92.5)
  assert.equal(formatRequiredScore(required, 2), "92.50")
  assert.equal(calculateRequiredScore(92.5, 20, 93), 95)
  for (const [examScore, letter] of [[92.49, "A−"], [92.5, "A"]]) {
    const final = calculateFinalGrade(92.5, 20, examScore)
    assert.equal(getGradeBand(applyFinalGradeRounding(final, rounded), bands)?.label, letter)
  }
})

test("one rounding pass determines the projected label, never the current standing", () => {
  const final = calculateFinalGrade(92, 10, 100)
  assert.equal(final, 92.8)
  assert.equal(getGradeBand(92.8, bands)?.label, "A−")
  assert.equal(getGradeBand(applyFinalGradeRounding(final), bands)?.label, "A−")
  assert.equal(getGradeBand(applyFinalGradeRounding(final, rounded), bands)?.label, "A")
  assert.equal(applyFinalGradeRounding(92.499, rounded), 92)
})

test("a zero-weight final cannot change the grade but the final-rounding policy still applies", () => {
  assert.equal(calculateRequiredScore(92.5, 0, 93, rounded), 0)
  assert.equal(calculateRequiredScore(92.5, 0, 93), Infinity)
  assert.equal(calculateRequiredScore(92.49, 0, 93, rounded), Infinity)
  assert.equal(calculateFinalGrade(92.5, 0, 0), 92.5)
})

test("keeps exact 0% and 100% boundaries and never caps an impossible score at 100%", () => {
  assert.equal(calculateRequiredScore(100, 7.5, 93, rounded), 0)
  assert.equal(calculateRequiredScore(90, 25, 93, rounded), 100)
  const required = calculateRequiredScore(91.4, 10, 93, rounded)
  assert.ok(required > 100)
  assert.equal(formatRequiredScore(required, 2), "102.40")
  assert.equal(formatRequiredScore(calculateRequiredScore(91.4, 10, 93), 2), "107.40")
})

test("100% weight uses the exam alone and fractional grade cutoffs follow the rounded grade", () => {
  assert.equal(calculateFinalGrade(75.21, 100, 92.5), 92.5)
  assert.equal(calculateRequiredScore(75.21, 100, 92.1, rounded), 92.5)
  assert.equal(calculateRequiredScore(75.21, 100, 92.1), 92.1)
})

test("displayed exam requirements round up at user precision without promoting binary noise", () => {
  assert.equal(formatRequiredScore(92.501, 2), "92.51")
  assert.equal(formatRequiredScore(92.5, 1), "92.5")
  assert.equal(formatRequiredScore(92.5, 0), "93")
  assert.equal(formatRequiredScore(92.50000000000001, 2), "92.50")
  assert.equal(formatRequiredScore(-12, 2), "0.00")
})

test("fractional weights preserve both sides of exact decimal grade thresholds", () => {
  const required = calculateRequiredScore(88.4, 63.84, 49, rounded)
  assert.equal(formatRequiredScore(required, 2), "25.90")
  assert.equal(calculateFinalGrade(88.4, 63.84, 25.9), 48.5)
  assert.equal(applyFinalGradeRounding(calculateFinalGrade(88.4, 63.84, 25.9), rounded), 49)
  assert.equal(applyFinalGradeRounding(calculateFinalGrade(88.4, 63.84, 25.89), rounded), 48)
  assert.equal(formatRequiredScore(calculateRequiredScore(57.9, 1, 58, rounded), 2), "17.90")
  assert.equal(formatRequiredScore(calculateRequiredScore(74.91, 79.76, 45), 2), "37.41")
  assert.equal(calculateFinalGrade(74.91, 79.76, 37.41), 45)
})
