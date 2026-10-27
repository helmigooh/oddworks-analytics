"use client"

import { useState } from "react"
import Link from "next/link"
import { fitnessMembers } from "@/data/fitness-members"
import {
  assessRoutine,
  type RoutineStatus
} from "@/lib/routine"

type SortKey = "member" | "change" | "status"

const statusOrder: Record<RoutineStatus, number> = {
  "At Risk": 0,
  Declining: 1,
  Stable: 2
}

const statusStyles: Record<RoutineStatus, string> = {
  "At Risk": "bg-red-100 text-red-700",
  Declining: "bg-amber-100 text-amber-700",
  Stable: "bg-emerald-100 text-emerald-700"
}

function formatChange(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`
}

function getSignal(
  status: RoutineStatus,
  currentVisits: number
) {
  if (currentVisits === 0) return "No recent visits"
  if (status === "At Risk") return "Sharp frequency drop"
  if (status === "Declining") return "Frequency declining"
  return "Routine broadly stable"
}

export default function BehaviourOverview() {
  const [sortKey, setSortKey] = useState<SortKey>("status")
  const [ascending, setAscending] = useState(true)

  function changeSort(key: SortKey) {
    if (sortKey === key) {
      setAscending((previous) => !previous)
    } else {
      setSortKey(key)
      setAscending(true)
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return "↕"
    return ascending ? "↑" : "↓"
  }

  const members = fitnessMembers
    .map((member) => ({
      ...member,
      assessment: assessRoutine(member)
    }))
    .sort(
      (a, b) =>
        statusOrder[a.assessment.status] -
          statusOrder[b.assessment.status] ||
        a.assessment.changePercent -
          b.assessment.changePercent
    )

  const sortedMembers = [...members].sort((a, b) => {
    let result = 0

    if (sortKey === "member") {
      result = a.id.localeCompare(b.id)
    } else if (sortKey === "change") {
      result =
        a.assessment.changePercent -
        b.assessment.changePercent
    } else {
      result =
        statusOrder[a.assessment.status] -
        statusOrder[b.assessment.status]

      if (result === 0) {
        result =
          a.assessment.changePercent -
          b.assessment.changePercent
      }
    }

    if (result === 0) {
      result = a.id.localeCompare(b.id)
    }

    return ascending ? result : -result
  })

  const countStatus = (status: RoutineStatus) =>
    members.filter(
      (member) => member.assessment.status === status
    ).length

  const summary = [
    {
      label: "Members",
      value: members.length,
      style: "border-slate-200 bg-white",
      text: "text-slate-900"
    },
    {
      label: "Stable",
      value: countStatus("Stable"),
      style: "border-emerald-200 bg-emerald-50/70",
      text: "text-emerald-800"
    },
    {
      label: "Declining",
      value: countStatus("Declining"),
      style: "border-amber-200 bg-amber-50/70",
      text: "text-amber-800"
    },
    {
      label: "At Risk",
      value: countStatus("At Risk"),
      style: "border-red-200 bg-red-50/70",
      text: "text-red-800"
    }
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <header className="mb-10">
          <div className="mb-5">
            <Link
              href="/"
              className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
            >
              ← Customer Health Copilot
            </Link>
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Oddworks Analytics · Behaviour Insights
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Training Routine Overview
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Explore how training behaviour changes during the first
            90 days of membership. Identify members whose activity
            may require closer investigation.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Synthetic member cohort · Rules-based assessment ·
            Not a churn prediction
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-5 ${item.style}`}
            >
              <p className="text-sm text-slate-600">
                {item.label}
              </p>

              <p className={`mt-2 text-2xl font-semibold ${item.text}`}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold">
              Member Behaviour
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Prioritised by routine status and frequency change.
              Each member is compared with their own initial
              30-day training frequency.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium"
                      aria-sort={sortKey === "member" ? (ascending ? "ascending" : "descending") : "none"}>
                    <button onClick={() => changeSort("member")}
                      className="cursor-pointer hover:text-slate-900">
                      Member {sortIcon("member")}
                    </button>
                  </th>
                  <th className="px-5 py-4 font-medium">Club</th>
                  <th className="px-5 py-4 font-medium">Started</th>
                  <th className="px-5 py-4 font-medium">Baseline</th>
                  <th className="px-5 py-4 font-medium">Current</th>
                  <th className="px-5 py-4 font-medium"
                      aria-sort={sortKey === "change" ? (ascending ? "ascending" : "descending") : "none"}>
                    <button onClick={() => changeSort("change")}
                      className="cursor-pointer hover:text-slate-900">
                      Change {sortIcon("change")}
                    </button>
                  </th>
                  <th className="px-5 py-4 font-medium"
                      aria-sort={sortKey === "status" ? (ascending ? "ascending" : "descending") : "none"}>
                    <button onClick={() => changeSort("status")}
                      className="cursor-pointer hover:text-slate-900">
                      Status {sortIcon("status")}
                    </button>
                  </th>
                  <th className="px-5 py-4 font-medium">Signal</th>
                </tr>
              </thead>

              <tbody>
                {sortedMembers.map((member) => {
                  const a = member.assessment

                  return (
                    <tr
                      key={member.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        <Link
                          href={`/behaviour/${member.id}`}
                          className="text-slate-800 underline decoration-slate-300 underline-offset-4 hover:text-slate-950"
                        >
                          {member.name}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {member.club}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {member.startDate}
                      </td>

                      <td className="px-5 py-4">
                        {a.baselineVisits}
                      </td>

                      <td className="px-5 py-4">
                        {a.currentVisits}
                      </td>

                      <td
                        className={`px-5 py-4 font-semibold ${
                          a.status === "At Risk"
                            ? "text-red-700"
                            : a.status === "Declining"
                            ? "text-amber-700"
                            : "text-slate-700"
                        }`}
                      >
                        {formatChange(a.changePercent)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[a.status]
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {getSignal(a.status, a.currentVisits)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>

            </table>
          </div>
        </section>

        <footer className="mt-6 text-xs leading-5 text-slate-500">
          100 synthetic members · Three consecutive 30-day periods ·
          Status thresholds are illustrative, not empirically validated.
          Behavioural change does not establish its underlying cause.
        </footer>

      </div>
    </main>
  )
}
