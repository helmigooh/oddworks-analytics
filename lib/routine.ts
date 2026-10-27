import type { FitnessMember } from "@/data/fitness-members"

export type RoutineStatus = "Stable" | "Declining" | "At Risk"

export type RoutineAssessment = {
  status: RoutineStatus
  baselineVisits: number
  month2Visits: number
  currentVisits: number
  month2ChangePercent: number
  changePercent: number
  firstWarningMonth: 2 | 3 | null
  signal: string
  suggestedNextStep: string
}

/**
 * Explainable, rules-based routine assessment.
 *
 * Month 1 = baseline (days 1–30)
 * Month 2 = early observation (days 31–60)
 * Month 3 = current assessment (days 61–90)
 *
 * A decline of 20% or more triggers a warning signal.
 * All thresholds are illustrative and not validated.
 * No churn prediction or causal inference.
 */
export function assessRoutine(
  member: FitnessMember
): RoutineAssessment {
  const [baselineVisits, month2Visits, currentVisits] =
    member.visitsByPeriod

  if (baselineVisits <= 0) {
    throw new Error("A positive initial baseline is required.")
  }

  const month2Change =
    (month2Visits - baselineVisits) / baselineVisits

  const relativeChange =
    (currentVisits - baselineVisits) / baselineVisits

  const month2ChangePercent = Math.round(month2Change * 100)
  const changePercent = Math.round(relativeChange * 100)

  // Earliest completed period showing a relevant decline.
  const firstWarningMonth: 2 | 3 | null =
    month2Change <= -0.2
      ? 2
      : relativeChange <= -0.2
        ? 3
        : null

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
      "Continue monitoring. No immediate intervention indicated by the current signal."
  }

  const signal =
    `${baselineVisits} to ${currentVisits} visits ` +
    `(${changePercent > 0 ? "+" : ""}${changePercent}%) ` +
    `between Month 1 and Month 3.`

  return {
    status,
    baselineVisits,
    month2Visits,
    currentVisits,
    month2ChangePercent,
    changePercent,
    firstWarningMonth,
    signal,
    suggestedNextStep
  }
}
