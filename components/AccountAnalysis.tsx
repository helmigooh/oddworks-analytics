"use client"

import { useState } from "react"
import {
  analyseAccount,
  type AccountAnalysis as AccountAnalysisResult
} from "@/lib/analysis"
import type { Account } from "@/lib/health"

type AccountAnalysisProps = {
  account: Account
}

export default function AccountAnalysis({
  account
}: AccountAnalysisProps) {
  const [analysis, setAnalysis] =
    useState<AccountAnalysisResult | null>(null)

  const handleAnalyse = () => {
    const result = analyseAccount(account)
    setAnalysis(result)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              AI Account Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Interpret current account signals and surface possible next actions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyse}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Analyse Account
          </button>
        </div>
      </div>

      {!analysis ? (
        <div className="px-6 py-8 text-sm text-slate-500">
          Run the analysis to interpret the current account-health signals.
        </div>
      ) : (
        <div className="space-y-7 px-6 py-6">
          {/* Health summary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Health Summary
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              {analysis.summary}
            </p>
          </div>

          {/* Risk drivers */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Key Risk Drivers
            </p>

            <ul className="mt-3 space-y-2">
              {analysis.riskDrivers.map((driver) => (
                <li
                  key={driver}
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested next actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested Next Actions
            </p>

            <ul className="mt-3 space-y-2">
              {analysis.nextActions.map((action) => (
                <li
                  key={action}
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              Prototype analysis based only on available account signals ·
              Human review required
            </p>
          </div>
        </div>
      )}
    </section>
  )
}