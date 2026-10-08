export type Account = {
  id: string
  name: string
  arr: number
  licensedUsers: number
  activeUsers: number
  workflowAdoption: number
  usageTrend: number
  openSupportTickets: number
  criticalSupportTickets: number
  daysToRenewal: number
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

// Keep calculated scores within a consistent 0–100 range.
function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

// Share of licensed users who were active in the current 30-day period.
export function calculateSeatUtilisation(account: Account) {
  if (account.licensedUsers === 0) {
    return 0
  }

  return clamp(
    (account.activeUsers / account.licensedUsers) * 100
  )
}

// Translate usage change into a simple 0–100 health signal.
export function calculateUsageHealth(trend: number) {
  return clamp(75 + trend * 1.5)
}

// Translate open and critical support issues into a health signal.
export function calculateSupportHealth(
  openTickets: number,
  criticalTickets: number
) {
  let score = 100

  if (openTickets >= 5) {
    score = 40
  } else if (openTickets >= 3) {
    score = 60
  } else if (openTickets >= 1) {
    score = 80
  }

  score -= criticalTickets * 20

  return clamp(score)
}

// Rules-based health score.
// Renewal timing is deliberately kept separate from account health.
export function calculateHealthScore(account: Account) {
  const seatUtilisation = calculateSeatUtilisation(account)
  const usageHealth = calculateUsageHealth(account.usageTrend)
  const supportHealth = calculateSupportHealth(
    account.openSupportTickets,
    account.criticalSupportTickets
  )

  const score =
    seatUtilisation * 0.35 +
    account.workflowAdoption * 0.35 +
    usageHealth * 0.2 +
    supportHealth * 0.1

  return Math.round(score)
}

// Primary decision-support classification.
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) {
    return "LOW"
  }

  if (score >= 55) {
    return "MEDIUM"
  }

  return "HIGH"
}