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

  const changeLabel =
    `${assessment.changePercent > 0 ? "+" : ""}` +
    `${assessment.changePercent}%`

  const explanation =
    assessment.status === "At Risk"
      ? "Training frequency has declined substantially compared with the member's initial routine."
      : assessment.status === "Declining"
        ? "Training frequency is decreasing compared with the initial routine."
        : "Training frequency remains broadly consistent with the initial routine."

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

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Initial 30 days
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {assessment.baselineVisits}
              <span className="ml-2 text-sm font-normal text-slate-500">
                visits
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Days 61–90
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {assessment.currentVisits}
              <span className="ml-2 text-sm font-normal text-slate-500">
                visits
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Change vs baseline
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
              {changeLabel}
            </p>
          </div>
        </section>

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
                    Days {index * 30 + 1}–{(index + 1) * 30}
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
              Based on illustrative rules comparing the first
              and third 30-day periods. This is not a churn
              prediction.
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
