import type { FitnessMember } from "@/data/fitness-members"

export type RoutineStatus = "Stable" | "Declining" | "At Risk"

export type RoutineAssessment = {
  status: RoutineStatus
  baselineVisits: number
  currentVisits: number
  changePercent: number
  signal: string
  suggestedNextStep: string
}

/**
 * Explainable, rules-based routine assessment.
 *
 * Comparison: days 61–90 vs days 1–30.
 * Thresholds are illustrative, not validated.
 * This is not a churn prediction.
 */
export function assessRoutine(
  member: FitnessMember
): RoutineAssessment {
  const [baselineVisits, , currentVisits] = member.visitsByPeriod

  if (baselineVisits <= 0) {
    throw new Error("A positive initial baseline is required.")
  }

  const relativeChange =
    (currentVisits - baselineVisits) / baselineVisits

  const changePercent = Math.round(relativeChange * 100)

  let status: RoutineStatus
  let suggestedNextStep: string

  if (relativeChange <= -0.5) {
    status = "At Risk"
    suggestedNextStep =
      "Consider a targeted check-in or training review to understand potential barriers."
  } else if (relativeChange <= -0.2) {
    status = "Declining"
    suggestedNextStep =
      "Monitor the trend and consider a light-touch check-in if the decline continues."
  } else {
    status = "Stable"
    suggestedNextStep =
      "Continue monitoring. No immediate intervention indicated by this signal."
  }

  const signal =
    `${baselineVisits} to ${currentVisits} visits ` +
    `(${changePercent > 0 ? "+" : ""}${changePercent}%) ` +
    `between the first and third 30-day periods.`

  return {
    status,
    baselineVisits,
    currentVisits,
    changePercent,
    signal,
    suggestedNextStep
  }
}
