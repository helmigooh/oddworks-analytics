import Link from "next/link"
import accounts from "@/data/accounts.json"
import {
  calculateHealthScore,
  calculateSeatUtilisation,
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

// Explicit priority order for the portfolio.
const riskOrder = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2
} as const

// Shared visual helpers for scanability.
function getHealthTextClass(score: number) {
  if (score < 55) return "text-red-700 font-semibold"
  if (score < 75) return "text-amber-700 font-semibold"
  return "text-emerald-700 font-semibold"
}

function getMetricTextClass(value: number) {
  if (value < 50) return "text-red-700 font-semibold"
  if (value < 70) return "text-amber-700 font-semibold"
  return "text-emerald-700 font-semibold"
}

function getUsageTrendClass(value: number) {
  if (value < -10) return "text-red-700 font-semibold"
  if (value < 0) return "text-amber-700 font-semibold"
  return "text-emerald-700 font-semibold"
}

function getRenewalClass(days: number) {
  if (days < 30) return "text-red-700 font-semibold"
  if (days <= 60) return "text-amber-700 font-semibold"
  return "text-slate-700"
}

export default function Home() {
  // Add calculated health signals to the synthetic account data.
  const portfolio = (accounts as Account[])
    .map((account) => {
      const healthScore = calculateHealthScore(account)
      const riskLevel = getRiskLevel(healthScore)
      const seatUtilisation = Math.round(
        calculateSeatUtilisation(account)
      )

      return {
        ...account,
        healthScore,
        riskLevel,
        seatUtilisation
      }
    })
    .sort(
      (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    )

  // Portfolio-level summary metrics.
  const totalArr = portfolio.reduce(
    (sum, account) => sum + account.arr,
    0
  )

  const highRiskCount = portfolio.filter(
    (account) => account.riskLevel === "HIGH"
  ).length

  const mediumRiskCount = portfolio.filter(
    (account) => account.riskLevel === "MEDIUM"
  ).length

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Product header */}
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Oddworks Analytics
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Customer Health Copilot
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Identify accounts that may need attention before renewal.
          </p>
        </header>

        {/* Portfolio summary */}
        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Accounts
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {portfolio.length}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/70 p-5">
            <p className="text-sm text-red-700">
              High Risk
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-800">
              {highRiskCount}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="text-sm text-amber-700">
              Medium Risk
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-800">
              {mediumRiskCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Portfolio ARR
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(totalArr)}
            </p>
          </div>
        </section>

        {/* Account portfolio */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid gap-4 border-b border-slate-200 px-6 py-4 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <h2 className="font-semibold">
                Account Portfolio
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Prioritised view of current customer-health signals.
              </p>
            </div>

            {/* Compact metric legend */}
            <div className="grid gap-x-5 gap-y-1 text-xs leading-5 text-slate-500 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-700">
                  Seat
                </span>{" "}
                = active / licensed users
              </p>

              <p>
                <span className="font-medium text-slate-700">
                  Adoption
                </span>{" "}
                = relevant core workflows
              </p>

              <p>
                <span className="font-medium text-slate-700">
                  Trend
                </span>{" "}
                = vs previous 30 days
              </p>

              <p>
                <span className="font-medium text-slate-700">
                  Renewal
                </span>{" "}
                = days until renewal
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Account</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Health</th>
                  <th className="px-6 py-4 font-medium">Seat Utilisation</th>
                  <th className="px-6 py-4 font-medium">Workflow Adoption</th>
                  <th className="px-6 py-4 font-medium">Usage Trend</th>
                  <th className="px-6 py-4 font-medium">Support</th>
                  <th className="px-6 py-4 font-medium">Renewal</th>
                  <th className="px-6 py-4 font-medium">ARR</th>
                </tr>
              </thead>

              <tbody>
                {portfolio.map((account) => (
                  <tr
                    key={account.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/accounts/${account.id}`}
                        className="text-slate-800 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950 hover:decoration-slate-500"
                      >
                        {account.name}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.riskLevel === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : account.riskLevel === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {account.riskLevel}
                      </span>
                    </td>

                    <td className={`px-6 py-4 ${getHealthTextClass(account.healthScore)}`}>
                      {account.healthScore}
                    </td>

                    <td className={`px-6 py-4 ${getMetricTextClass(account.seatUtilisation)}`}>
                      {account.seatUtilisation}%
                    </td>

                    <td className={`px-6 py-4 ${getMetricTextClass(account.workflowAdoption)}`}>
                      {account.workflowAdoption}%
                    </td>

                    <td className={`px-6 py-4 ${getUsageTrendClass(account.usageTrend)}`}>
                      {account.usageTrend > 0 ? "+" : ""}
                      {account.usageTrend}%
                    </td>

                    <td className="px-6 py-4">
                      <div className="leading-5">
                        <p className="text-slate-700">
                          {account.openSupportTickets} open
                        </p>

                        {account.criticalSupportTickets > 0 && (
                          <p className="text-xs font-semibold text-red-700">
                            {account.criticalSupportTickets} critical
                          </p>
                        )}
                      </div>
                    </td>

                    <td className={`px-6 py-4 ${getRenewalClass(account.daysToRenewal)}`}>
                      {account.daysToRenewal} days
                    </td>

                    <td className="px-6 py-4">
                      {formatCurrency(account.arr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Prototype disclosure */}
        <footer className="mt-6 text-xs text-slate-500">
          Synthetic demo data · Rules-based health model · Decision support only
        </footer>
      </div>
    </main>
  )
}