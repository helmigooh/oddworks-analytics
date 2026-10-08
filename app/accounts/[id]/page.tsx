import Link from "next/link"
import { notFound } from "next/navigation"
import accounts from "@/data/accounts.json"
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

  // Find the requested account.
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
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Health Score
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {healthScore}
              <span className="text-lg text-slate-400">
                {" "}
                / 100
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Renewal
            </p>

            <p className="mt-2 text-2xl font-semibold">
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

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Support
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {account.openSupportTickets}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {account.criticalSupportTickets} critical
            </p>
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

              <p className="mt-2 text-xl font-semibold">
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

              <p className="mt-2 text-xl font-semibold">
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

              <p className="mt-2 text-xl font-semibold">
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

              <p className="mt-2 text-xl font-semibold">
                {account.openSupportTickets} open
              </p>

              <p className="mt-1 text-xs text-slate-500">
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

              <span className="font-medium">
                {seatUtilisation}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Workflow adoption
              </span>

              <span className="font-medium">
                {account.workflowAdoption}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Usage health
              </span>

              <span className="font-medium">
                {usageHealth}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-600">
                Support health
              </span>

              <span className="font-medium">
                {supportHealth}
              </span>
            </div>
          </div>
        </section>

        {/* AI analysis placeholder */}
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <h2 className="font-semibold">
            AI Account Analysis
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Interpret the existing account signals, highlight relevant
            risk drivers and suggest possible Customer Success actions.
          </p>

          <button
            type="button"
            disabled
            className="mt-5 cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Analyse Account
          </button>

          <p className="mt-3 text-xs text-slate-400">
            AI-generated decision support · Human review required
          </p>
        </section>
      </div>
    </main>
  )
}