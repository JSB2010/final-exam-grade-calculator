export const normalizeWeight = (weight: number): number => {
  if (!Number.isFinite(weight)) return 0
  return Math.min(Math.max(weight, 0), 100)
}

export const calculateFinalGrade = (current: number, weight: number, finalScore: number): number => {
  const normalizedWeight = normalizeWeight(weight) / 100
  return current * (1 - normalizedWeight) + finalScore * normalizedWeight
}

export const calculateRequiredScore = (
  current: number,
  weight: number,
  targetCutoff: number,
  options?: { roundToWhole?: boolean },
): number => {
  const normalizedWeight = normalizeWeight(weight) / 100
  if (normalizedWeight <= 0) {
    return current >= targetCutoff ? 0 : Number.POSITIVE_INFINITY
  }

  const adjustedCutoff = options?.roundToWhole ? targetCutoff - 0.5 : targetCutoff
  return (adjustedCutoff - (1 - normalizedWeight) * current) / normalizedWeight
}
