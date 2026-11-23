type GradeRounding = { roundToWhole?: boolean }

const decimalScale = (places: number): bigint => BigInt(`1${"0".repeat(places)}`)

// Preserve the decimal inputs at exact boundaries without rounding an intermediate grade.
const decimalParts = (value: number) => {
  const [coefficient, exponent = "0"] = value.toString().split("e")
  const [whole, fraction = ""] = coefficient.split(".")
  const places = fraction.length - Number(exponent)
  const units = BigInt(whole + fraction)
  return places < 0
    ? { units: units * decimalScale(-places), places: 0 }
    : { units, places }
}

const alignDecimals = (left: number, right: number) => {
  const a = decimalParts(left)
  const b = decimalParts(right)
  const places = Math.max(a.places, b.places)
  return {
    leftUnits: a.units * decimalScale(places - a.places),
    rightUnits: b.units * decimalScale(places - b.places),
    places,
  }
}

export const normalizeWeight = (weight: number): number => {
  if (!Number.isFinite(weight)) return 0
  return Math.min(Math.max(weight, 0), 100)
}

export const calculateFinalGrade = (current: number, weight: number, finalScore: number): number => {
  const normalizedWeight = normalizeWeight(weight)
  if (normalizedWeight === 0) return current
  if (normalizedWeight === 100) return finalScore
  if (!Number.isFinite(current) || !Number.isFinite(finalScore)) {
    return current + (finalScore - current) * (normalizedWeight / 100)
  }

  const grades = alignDecimals(current, finalScore)
  const examWeight = decimalParts(normalizedWeight)
  const weightScale = decimalScale(examWeight.places + 2)
  const finalUnits = grades.leftUnits * (weightScale - examWeight.units) + grades.rightUnits * examWeight.units
  return Number(`${finalUnits}e-${grades.places + examWeight.places + 2}`)
}

export const applyFinalGradeRounding = (grade: number, options?: GradeRounding): number =>
  options?.roundToWhole ? Math.round(grade) : grade

export const getFinalGradeThreshold = (cutoff: number, options?: GradeRounding): number =>
  options?.roundToWhole ? Math.ceil(cutoff) - 0.5 : cutoff

export const getGradeBand = <Band extends { cutoff: number }>(
  grade: number,
  bands: readonly Band[],
): Band | undefined => bands.find((band) => grade >= band.cutoff) ?? bands[bands.length - 1]

export const calculateRequiredScore = (
  current: number,
  weight: number,
  targetCutoff: number,
  options?: GradeRounding,
): number => {
  const normalizedWeight = normalizeWeight(weight)
  const threshold = getFinalGradeThreshold(targetCutoff, options)
  if (normalizedWeight === 0) {
    return current >= threshold ? 0 : Number.POSITIVE_INFINITY
  }
  if (normalizedWeight === 100) return threshold
  if (current === threshold) return current
  if (!Number.isFinite(current) || !Number.isFinite(threshold)) {
    return current + ((threshold - current) * 100) / normalizedWeight
  }

  const grades = alignDecimals(current, threshold)
  const examWeight = decimalParts(normalizedWeight)
  const weightScale = decimalScale(examWeight.places + 2)
  const numerator = grades.leftUnits * examWeight.units + (grades.rightUnits - grades.leftUnits) * weightScale
  const denominator = decimalScale(grades.places) * examWeight.units
  const required = Number(numerator) / Number(denominator)
  return Number.isNaN(required) ? current + ((threshold - current) * 100) / normalizedWeight : required
}

export const formatRequiredScore = (score: number, decimalPlaces: number): string => {
  const factor = 10 ** decimalPlaces
  const scaled = Math.max(0, score) * factor
  const nearest = Math.round(scaled)
  // Ignore floating-point noise at an integer boundary, not real fractional scores.
  const units = Math.abs(scaled - nearest) <= Number.EPSILON * Math.max(1, scaled) * 4
    ? nearest
    : Math.ceil(scaled)
  return (units / factor).toFixed(decimalPlaces)
}
