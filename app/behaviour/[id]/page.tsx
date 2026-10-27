import Link from "next/link"
import { notFound } from "next/navigation"
import { fitnessMembers } from "@/data/fitness-members"
import { assessRoutine } from "@/lib/routine"

export function generateStaticParams() {
  return fitnessMembers.map((member) => ({
    id: member.id
  }))
}

const statusStyles = {
  Stable: "bg-emerald-100 text-emerald-700",
  Declining: "bg-amber-100 text-amber-700",
  "At Risk": "bg-red-100 text-red-700"
}

function formatChange(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`
}

export default async function MemberDetail({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const member = fitnessMembers.find(
    (item) => item.id === id
  )

  if (!member) notFound()

  const assessment = assessRoutine(member)
  const visits = member.visitsByPeriod
  const maxVisits = Math.max(...visits, 1)

  const explanation =
    assessment.status === "At Risk"
      ? "Training frequency has declined substantially compared with the member's initial routine."
      : assessment.status === "Declining"
        ? "Training frequency is decreasing compared with the initial routine."
        : "Training frequency remains broadly consistent with the initial routine."

  const metrics = [
    {
      label: "Month 1",
      value: assessment.baselineVisits,
      detail: "Baseline · Days 1–30"
    },
    {
      label: "Month 2",
      value: assessment.month2Visits,
      detail: "Days 31–60"
    },
    {
      label: "Month 3",
      value: assessment.currentVisits,
      detail: "Days 61–90"
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <Link
          href="/behaviour"
          className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
        >
          ← Back to Behaviour Overview
        </Link>

        <header className="mb-8 mt-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Oddworks Analytics · Member Behaviour
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              {member.name}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[assessment.status]
              }`}
            >
              {assessment.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {member.club} · Joined {member.startDate}
          </p>
        </header>

        {/* Three months and overall change */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">
                {metric.label}
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {metric.value}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  visits
                </span>
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {metric.detail}
              </p>
            </div>
          ))}

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Change vs Baseline
            </p>

            <p
              className={`mt-2 text-2xl font-semibold ${
                assessment.changePercent <= -50
                  ? "text-red-700"
                  : assessment.changePercent <= -20
                    ? "text-amber-700"
                    : "text-slate-900"
              }`}
            >
              {formatChange(assessment.changePercent)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Month 3 vs Month 1
            </p>
          </div>
        </section>

        {/* Training history */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">
            Training History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recorded visits across three consecutive
            30-day periods.
          </p>

          <div className="mt-7 space-y-6">
            {visits.map((count, index) => (
              <div key={index}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">
                    Month {index + 1}
                    <span className="ml-2 text-xs text-slate-400">
                      Days {index * 30 + 1}–{(index + 1) * 30}
                    </span>
                  </span>

                  <span className="font-semibold">
                    {count} visits
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      index === 2 &&
                      assessment.status === "At Risk"
                        ? "bg-red-500"
                        : "bg-slate-500"
                    }`}
                    style={{
                      width: `${(count / maxVisits) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Early warning */}
        <section
          className={`mb-6 rounded-xl border p-6 ${
            assessment.firstWarningMonth !== null
              ? "border-amber-200 bg-amber-50/70"
              : "border-slate-200 bg-white"
          }`}
        >
          <h2 className="font-semibold">
            Early Warning Check
          </h2>

          {assessment.firstWarningMonth === 2 ? (
            <>
              <p className="mt-3 text-sm font-semibold text-amber-800">
                First warning signal · End of Month 2
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Training frequency had already changed by{" "}
                <strong>
                  {formatChange(assessment.month2ChangePercent)}
                </strong>{" "}
                compared with Month 1.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                This could have been an earlier opportunity
                to investigate the change and consider
                appropriate support. The underlying cause
                remains unknown.
              </p>
            </>
          ) : assessment.firstWarningMonth === 3 ? (
            <>
              <p className="mt-3 text-sm font-semibold text-amber-800">
                First warning signal · End of Month 3
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                No relevant decline was flagged after Month 2.
                A decline of{" "}
                <strong>
                  {formatChange(assessment.changePercent)}
                </strong>{" "}
                was identified at the end of Month 3.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                No significant decline detected
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                Neither Month 2 nor Month 3 crossed the
                illustrative 20% decline threshold compared
                with the initial routine.
              </p>
            </>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Retrospective assessment using completed
            30-day periods. Illustrative thresholds only.
            Not a real-time alert or predictive model.
          </p>
        </section>

        {/* Interpretation and uncertainty */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold">
              Why this classification?
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              {explanation}
            </p>

            <p className="mt-3 text-sm font-medium text-slate-900">
              {assessment.signal}
            </p>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Rules-based comparison of Month 3 with
              Month 1. This is not a churn prediction.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold">
              What we don't know
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              Visit frequency alone cannot explain the
              underlying reason for this behaviour.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Possible investigation areas include changing
              schedules, perceived training progress,
              support needs or experience barriers.
              None of these are established causes.
            </p>
          </div>
        </section>

        {/* Next action */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">
            Suggested Next Step
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-700">
            {assessment.suggestedNextStep}
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Recommendation for further investigation,
            not an automated action.
          </p>
        </section>

        {/* Measurement */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">
            How would we measure impact?
          </h2>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold">
                Primary outcome
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Training frequency and routine stability
                following a potential intervention.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">
                Comparison
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compare with a suitable group not receiving
                the intervention.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">
                Guardrails
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Club staff effort, communication burden
                and member feedback.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-6 text-xs leading-5 text-slate-500">
          Synthetic demonstration · Decision support only ·
          No real member data · No intervention has been conducted.
        </footer>

      </div>
    </main>
  )
}
