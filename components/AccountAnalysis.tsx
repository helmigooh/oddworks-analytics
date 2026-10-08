"use client"

import { useState } from "react"
import type { Account } from "@/lib/health"

type AccountAnalysisProps = {
  account: Account
}

type AnalysisResult = {
  summary: string
  riskDrivers: string[]
  nextActions: string[]
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            AI Decision Support
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            AI Account Analysis
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Interpret the available account signals and identify
            potential risk drivers and areas for Customer Success
            review.
          </p>
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
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Health Summary
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {analysis.summary}
            </p>
          </div>

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

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              AI-generated decision support · Based only on available
              account signals · Human review required
            </p>
          </div>
        </div>
      )}
    </section>
  )
}