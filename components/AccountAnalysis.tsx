"use client"

import { useState } from "react"
import {
  calculateHealthScore,
  calculateSeatUtilisation,
  getRiskLevel,
  type Account,
  type RiskLevel
} from "@/lib/health"

type AccountAnalysisProps = {
  account: Account
}

type AnalysisResult = {
  summary: string
  riskDrivers: string[]
  nextActions: string[]
}

function getRiskStyles(riskLevel: RiskLevel) {
  if (riskLevel === "HIGH") {
    return {
      border: "border-red-200",
      background: "bg-red-50",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700"
    }
  }

  if (riskLevel === "MEDIUM") {
    return {
      border: "border-amber-200",
      background: "bg-amber-50",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700"
    }
  }

  return {
    border: "border-emerald-200",
    background: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700"
  }
}

function getSignalTextClass(
  value: number,
  type: "percentage" | "trend"
) {
  if (type === "trend") {
    if (value < -10) return "text-red-700"
    if (value < 0) return "text-amber-700"
    return "text-emerald-700"
  }

  if (value < 50) return "text-red-700"
  if (value < 70) return "text-amber-700"
  return "text-emerald-700"
}

function getUrgencyStyles(daysToRenewal: number) {
  if (daysToRenewal < 30) {
    return {
      label: "Review now",
      border: "border-red-200",
      background: "bg-red-50",
      text: "text-red-700"
    }
  }

  if (daysToRenewal <= 60) {
    return {
      label: "Review soon",
      border: "border-amber-200",
      background: "bg-amber-50",
      text: "text-amber-700"
    }
  }

  return {
    label: "Monitor",
    border: "border-slate-200",
    background: "bg-slate-50",
    text: "text-slate-700"
  }
}

export default function AccountAnalysis({
  account
}: AccountAnalysisProps) {
  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const healthScore =
    calculateHealthScore(account)

  const riskLevel =
    getRiskLevel(healthScore)

  const seatUtilisation = Math.round(
    calculateSeatUtilisation(account)
  )

  const riskStyles =
    getRiskStyles(riskLevel)

  const urgencyStyles =
    getUrgencyStyles(account.daysToRenewal)

  async function handleAnalyse() {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          account
        })
      })

      if (!response.ok) {
        throw new Error(
          "The account analysis could not be generated."
        )
      }

      const result =
        (await response.json()) as AnalysisResult

      setAnalysis(result)
    } catch (error) {
      console.error(error)

      setError(
        "Unable to generate the AI analysis. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            AI Decision Support
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            AI Account Analysis
          </h2>

          {analysis && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Health Summary
              </p>

              <p className="mt-2 text-base leading-7 text-slate-800">
                {analysis.summary}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={isLoading}
          className="inline-flex min-w-36 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading
            ? "Analysing..."
            : analysis
              ? "Analyse Again"
              : "Analyse Account"}
        </button>
      </div>

      {!analysis && !isLoading && !error && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Run the analysis to interpret the current account signals.
        </div>
      )}

      {isLoading && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">
            Analysing account signals...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Generating decision support from the available data only.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Analysis failed
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-7">
          {/* Analysis Snapshot */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Analysis Snapshot
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Structured account signals behind the AI interpretation.
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${riskStyles.badge}`}
              >
                {riskLevel} RISK
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {/* Health */}
              <div
                className={`rounded-lg border p-4 ${riskStyles.border} ${riskStyles.background}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Health
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span
                    className={`text-3xl font-semibold ${riskStyles.text}`}
                  >
                    {healthScore}
                  </span>

                  <span className="pb-1 text-sm text-slate-500">
                    / 100
                  </span>
                </div>

                <p
                  className={`mt-1 text-sm font-medium ${riskStyles.text}`}
                >
                  {riskLevel} risk
                </p>
              </div>

              {/* Urgency */}
              <div
                className={`rounded-lg border p-4 ${urgencyStyles.border} ${urgencyStyles.background}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Renewal Urgency
                </p>

                <p
                  className={`mt-2 text-2xl font-semibold ${urgencyStyles.text}`}
                >
                  {account.daysToRenewal} days
                </p>

                <p
                  className={`mt-1 text-sm font-medium ${urgencyStyles.text}`}
                >
                  {urgencyStyles.label}
                </p>
              </div>
            </div>

            {/* Main Signals */}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Main Signals
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Seat utilisation
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${getSignalTextClass(
                      seatUtilisation,
                      "percentage"
                    )}`}
                  >
                    {seatUtilisation}%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Workflow adoption
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${getSignalTextClass(
                      account.workflowAdoption,
                      "percentage"
                    )}`}
                  >
                    {account.workflowAdoption}%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Usage trend
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${getSignalTextClass(
                      account.usageTrend,
                      "trend"
                    )}`}
                  >
                    {account.usageTrend > 0 ? "+" : ""}
                    {account.usageTrend}%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-500">
                    Support
                  </p>

                  <p
                    className={`mt-1 text-lg font-semibold ${
                      account.criticalSupportTickets > 0
                        ? "text-red-700"
                        : "text-slate-800"
                    }`}
                  >
                    {account.openSupportTickets} open
                  </p>

                  {account.criticalSupportTickets > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-red-700">
                      {account.criticalSupportTickets} critical
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">
                Health and renewal urgency are assessed separately.
                AI interpretation follows the structured account signals.
              </p>
            </div>
          </div>

          {/* Risk Drivers */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Key Risk Drivers
            </h3>

            <ul className="mt-2 space-y-2">
              {analysis.riskDrivers.map(
                (driver, index) => (
                  <li
                    key={`${driver}-${index}`}
                    className="flex gap-2 text-sm leading-6 text-slate-700"
                  >
                    <span className="text-slate-400">
                      •
                    </span>

                    <span>{driver}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Next Actions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Suggested Next Actions
            </h3>

            <ul className="mt-2 space-y-2">
              {analysis.nextActions.map(
                (action, index) => (
                  <li
                    key={`${action}-${index}`}
                    className="flex gap-2 text-sm leading-6 text-slate-700"
                  >
                    <span className="text-slate-400">
                      •
                    </span>

                    <span>{action}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Context + Guardrail */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Interprets the available account signals to surface
              relevant risk drivers and possible areas for Customer
              Success review.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              AI-generated decision support · Based only on available
              account signals · Human review required
            </p>
          </div>
        </div>
      )}
    </section>
  )
}