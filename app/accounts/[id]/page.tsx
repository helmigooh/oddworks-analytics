import Link from "next/link"
import { notFound } from "next/navigation"
import accounts from "@/data/accounts.json"
import AccountAnalysis from "@/components/AccountAnalysis"
import {
  calculateHealthScore,
  calculateSeatUtilisation,
  calculateSupportHealth,
  calculateUsageHealth,
  getRiskLevel,
  type Account
} from "@/lib/health"

// Format recurring revenue consistently.
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value)
}

function getHealthTextClass(score: number) {
  if (score < 55) return "text-red-700"
  if (score < 75) return "text-amber-700"
  return "text-emerald-700"
}

function getMetricTextClass(value: number) {
  if (value < 50) return "text-red-700"
  if (value < 70) return "text-amber-700"
  return "text-emerald-700"
}

function getUsageTrendClass(value: number) {
  if (value < -10) return "text-red-700"
  if (value < 0) return "text-amber-700"
  return "text-emerald-700"
}

function getRenewalClass(days: number) {
  if (days < 30) return "text-red-700"
  if (days <= 60) return "text-amber-700"
  return "text-slate-900"
}

type AccountPageProps = {
  params: Promise<{
    id: string
  }>
}

// Pre-render the known synthetic account pages.
export function generateStaticParams() {
  return (accounts as Account[]).map((account) => ({
    id: account.id
  }))
}

export default async function AccountPage({
  params
}: AccountPageProps) {
  const { id } = await params

  const account = (accounts as Account[]).find(
    (item) => item.id === id
  )

  if (!account) {
    notFound()
  }

  // Calculate transparent health signals.
  const healthScore = calculateHealthScore(account)
  const riskLevel = getRiskLevel(healthScore)

  const seatUtilisation = Math.round(
    calculateSeatUtilisation(account)
  )

  const usageHealth = Math.round(
    calculateUsageHealth(account.usageTrend)
  )

  const supportHealth = Math.round(
    calculateSupportHealth(
      account.openSupportTickets,
      account.criticalSupportTickets
    )
  )

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Navigation */}
        <Link
          href="/"
          className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-500"
        >
          ← Back to portfolio
        </Link>

        {/* Account header */}
        <header className="mb-8 mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {account.name}
            </h1>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                riskLevel === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : riskLevel === "MEDIUM"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {riskLevel} RISK
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Account health overview and current renewal signals.
          </p>
        </header>

        {/* Top-level account metrics */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div
            className={`rounded-xl border p-5 ${
              healthScore < 55
                ? "border-red-200 bg-red-50/70"
                : healthScore < 75
                  ? "border-amber-200 bg-amber-50/70"
                  : "border-emerald-200 bg-emerald-50/70"
            }`}
          >
            <p className={`text-sm ${getHealthTextClass(healthScore)}`}>
              Health Score
            </p>

            <p
              className={`mt-2 text-3xl font-semibold ${getHealthTextClass(
                healthScore
              )}`}
            >
              {healthScore}
              <span className="text-lg opacity-50">
                {" "}
                / 100
              </span>
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 ${
              account.daysToRenewal < 30
                ? "border-red-200 bg-red-50/70"
                : account.daysToRenewal <= 60
                  ? "border-amber-200 bg-amber-50/70"
                  : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-sm text-slate-500">
              Renewal
            </p>

            <p
              className={`mt-2 text-2xl font-semibold ${getRenewalClass(
                account.daysToRenewal
              )}`}
            >
              {account.daysToRenewal} days
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              ARR
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(account.arr)}
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 ${
              account.criticalSupportTickets > 0
                ? "border-red-200 bg-red-50/70"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-sm text-slate-500">
              Support
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {account.openSupportTickets} open
            </p>

            {account.criticalSupportTickets > 0 && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                {account.criticalSupportTickets} critical
              </p>
            )}
          </div>
        </section>

        {/* Raw account signals */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold">
              Account Signals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current signals used for the health assessment.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Seat utilisation
              </p>

              <p
                className={`mt-2 text-xl font-semibold ${getMetricTextClass(
                  seatUtilisation
                )}`}
              >
                {seatUtilisation}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {account.activeUsers} of {account.licensedUsers} users active
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Workflow adoption
              </p>

              <p
                className={`mt-2 text-xl font-semibold ${getMetricTextClass(
                  account.workflowAdoption
                )}`}
              >
                {account.workflowAdoption}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Relevant core workflows in use
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Usage trend
              </p>

              <p
                className={`mt-2 text-xl font-semibold ${getUsageTrendClass(
                  account.usageTrend
                )}`}
              >
                {account.usageTrend > 0 ? "+" : ""}
                {account.usageTrend}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Versus previous 30 days
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Support
              </p>

              <p className="mt-2 text-xl font-semibold text-slate-900">
                {account.openSupportTickets} open
              </p>

              <p
                className={`mt-1 text-xs ${
                  account.criticalSupportTickets > 0
                    ? "font-semibold text-red-700"
                    : "text-slate-500"
                }`}
              >
                {account.criticalSupportTickets} critical
              </p>
            </div>
          </div>
        </section>

        {/* Explainable scoring */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold">
              Why this rating?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Transparent rules-based signal scores behind the overall health rating.
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-6">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Seat utilisation
              </span>

              <span
                className={`font-semibold ${getMetricTextClass(
                  seatUtilisation
                )}`}
              >
                {seatUtilisation}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Workflow adoption
              </span>

              <span
                className={`font-semibold ${getMetricTextClass(
                  account.workflowAdoption
                )}`}
              >
                {account.workflowAdoption}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Usage health
              </span>

              <span
                className={`font-semibold ${getMetricTextClass(
                  usageHealth
                )}`}
              >
                {usageHealth}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Support health
              </span>

              <span
                className={`font-semibold ${getMetricTextClass(
                  supportHealth
                )}`}
              >
                {supportHealth}
              </span>
            </div>
          </div>
        </section>

        {/* Interactive analysis */}
        <AccountAnalysis account={account} />
      </div>
    </main>
  )
}