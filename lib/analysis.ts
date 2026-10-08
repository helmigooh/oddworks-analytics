import {
  calculateHealthScore,
  calculateSeatUtilisation,
  getRiskLevel,
  type Account
} from "@/lib/health"

export type AccountAnalysis = {
  summary: string
  riskDrivers: string[]
  nextActions: string[]
}

// Build a transparent analysis from known account signals only.
// No inferred customer causes or invented context.
export function analyseAccount(
  account: Account
): AccountAnalysis {
  const healthScore = calculateHealthScore(account)
  const riskLevel = getRiskLevel(healthScore)

  const seatUtilisation = Math.round(
    calculateSeatUtilisation(account)
  )

  const riskDrivers: string[] = []
  const nextActions: string[] = []

  // Seat utilisation
  if (seatUtilisation < 50) {
    riskDrivers.push(
      `Low seat utilisation: ${seatUtilisation}%`
    )

    nextActions.push(
      "Review whether licensed users are actively adopting the product."
    )
  } else if (seatUtilisation < 70) {
    riskDrivers.push(
      `Moderate seat utilisation: ${seatUtilisation}%`
    )
  }

  // Workflow adoption
  if (account.workflowAdoption < 50) {
    riskDrivers.push(
      `Low workflow adoption: ${account.workflowAdoption}%`
    )

    nextActions.push(
      "Review potential blockers behind low workflow adoption."
    )
  } else if (account.workflowAdoption < 70) {
    riskDrivers.push(
      `Moderate workflow adoption: ${account.workflowAdoption}%`
    )
  }

  // Usage trend
  if (account.usageTrend < -10) {
    riskDrivers.push(
      `Usage declined ${Math.abs(account.usageTrend)}% versus the previous 30 days`
    )

    nextActions.push(
      "Review the recent usage decline with the account."
    )
  } else if (account.usageTrend < 0) {
    riskDrivers.push(
      `Usage declined ${Math.abs(account.usageTrend)}% versus the previous 30 days`
    )
  }

  // Support
  if (account.criticalSupportTickets > 0) {
    riskDrivers.push(
      `${account.criticalSupportTickets} critical support ${
        account.criticalSupportTickets === 1 ? "issue" : "issues"
      } currently open`
    )

    nextActions.push(
      "Prioritise review and resolution of critical support issues."
    )
  } else if (account.openSupportTickets >= 5) {
    riskDrivers.push(
      `${account.openSupportTickets} support issues currently open`
    )
  }

  // Renewal urgency stays separate from health.
  if (account.daysToRenewal <= 60) {
    nextActions.push(
      `Reassess account health before the renewal in ${account.daysToRenewal} days.`
    )
  }

  // Healthy accounts still need a meaningful response.
  if (riskDrivers.length === 0) {
    riskDrivers.push(
      "No major negative health signals are currently visible."
    )
  }

  if (nextActions.length === 0) {
    nextActions.push(
      "Continue monitoring adoption, usage and support signals."
    )
  }

  const summary =
    `${account.name} is currently classified as ${riskLevel.toLowerCase()} risk ` +
    `with a health score of ${healthScore}/100. ` +
    `The assessment is based on seat utilisation, workflow adoption, ` +
    `recent usage trend and support activity.`

  return {
    summary,
    riskDrivers,
    nextActions
  }
}