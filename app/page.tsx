import accounts from "@/data/accounts.json"
import {
  calculateHealthScore,
  calculateSeatUtilisation,
  getRiskLevel,
  type Account
} from "@/lib/health"

// Format ARR consistently for the portfolio view.
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value)
}

// Keep risk ordering explicit and easy to extend later.
const riskOrder = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2
} as const

export default function Home() {
  // Enrich raw account data with calculated health signals.
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
            <p className="text-sm text-slate-500">Accounts</p>
            <p className="mt-2 text-2xl font-semibold">
              {portfolio.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">High Risk</p>
            <p className="mt-2 text-2xl font-semibold">
              {highRiskCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Medium Risk</p>
            <p className="mt-2 text-2xl font-semibold">
              {mediumRiskCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Portfolio ARR</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(totalArr)}
            </p>
          </div>
        </section>

        {/* Account portfolio */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold">Account Portfolio</h2>
            <p className="mt-1 text-sm text-slate-500">
              Prioritised view of current customer-health signals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Account</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Health</th>
                  <th className="px-6 py-4 font-medium">
                    Seat Utilisation
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Workflow Adoption
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Usage Trend
                  </th>
                  <th className="px-6 py-4 font-medium">Support</th>
                  <th className="px-6 py-4 font-medium">Renewal</th>
                  <th className="px-6 py-4 font-medium">ARR</th>
                </tr>
              </thead>

              <tbody>
                {portfolio.map((account) => (
                  <tr
                    key={account.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {account.name}
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

                    <td className="px-6 py-4">
                      {account.healthScore}
                    </td>

                    <td className="px-6 py-4">
                      {account.seatUtilisation}%
                    </td>

                    <td className="px-6 py-4">
                      {account.workflowAdoption}%
                    </td>

                    <td className="px-6 py-4">
                      {account.usageTrend > 0 ? "+" : ""}
                      {account.usageTrend}%
                    </td>

                    <td className="px-6 py-4">
                      {account.openSupportTickets}
                      {account.criticalSupportTickets > 0
                        ? ` (${account.criticalSupportTickets} critical)`
                        : ""}
                    </td>

                    <td className="px-6 py-4">
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