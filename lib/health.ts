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

function clamp(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function calculateSeatUtilisation(account: Account) {
  return clamp((account.activeUsers / account.licensedUsers) * 100)
}

export function calculateUsageHealth(trend: number) {
  return clamp(75 + trend * 1.5)
}

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

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "LOW"
  if (score >= 55) return "MEDIUM"
  return "HIGH"
}