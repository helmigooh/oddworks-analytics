"use client"

import { useState } from "react"
import type { RoutineStatus } from "@/lib/routine"

type MemberAnalysisProps = {
  memberId: string
  routineStatus: RoutineStatus
}

type AnalysisResult = {
  observed: string
  unknown: string
  researchOpportunity: string
  suggestedAction: string
  measurement: string
}

const sections: {
  key: keyof AnalysisResult
  title: string
  icon: string
}[] = [
  { key: "observed", title: "Observed Behaviour", icon: "◉" },
  { key: "unknown", title: "What We Don't Know", icon: "?" },
  { key: "researchOpportunity", title: "Research Opportunity", icon: "⌕" },
  { key: "suggestedAction", title: "Suggested Action", icon: "→" },
  { key: "measurement", title: "Measurement", icon: "◌" }
]

const statusStyles: Record<RoutineStatus, string> = {
  Stable: "bg-emerald-100 text-emerald-700",
  Declining: "bg-amber-100 text-amber-700",
  "At Risk": "bg-red-100 text-red-700"
}

/**
 * Highlight selected factual values in plain-text AI output.
 * No HTML injection and no AI-controlled styling.
 */
const factPattern =
  /(At Risk|Declining|Stable|[-−]\d+(?:\.\d+)?%|\b\d+(?:\s*(?:,|→|to|and)\s*\d+){2,}\b)/g

function highlightFacts(text: string) {
  return text.split(factPattern).map((part, index) => {
    if (part === "At Risk") {
      return (
        <strong key={index} className="font-semibold text-red-700">
          {part}
        </strong>
      )
    }

    if (part === "Declining") {
      return (
        <strong key={index} className="font-semibold text-amber-700">
          {part}
        </strong>
      )
    }

    if (part === "Stable") {
      return (
        <strong key={index} className="font-semibold text-emerald-700">
          {part}
        </strong>
      )
    }

    if (
      /^[-−]\d+(?:\.\d+)?%$/.test(part) ||
      /^\d+(?:\s*(?:,|→|to|and)\s*\d+){2,}$/.test(part)
    ) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part}
        </strong>
      )
    }

    return part
  })
}

export default function MemberAnalysis({
  memberId,
  routineStatus
}: MemberAnalysisProps) {
  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyse() {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch(
        "/api/behaviour/analyse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ memberId })
        }
      )

      if (!response.ok) {
        throw new Error("AI analysis request failed.")
      }

      const result: unknown = await response.json()

      if (
        typeof result !== "object" ||
        result === null ||
        !sections.every(
          ({ key }) =>
            typeof (result as Record<string, unknown>)[key] === "string"
        )
      ) {
        throw new Error("Invalid AI analysis response.")
      }

      setAnalysis(result as AnalysisResult)
    } catch (error) {
      console.error(error)
      setError(
        "Unable to generate the analysis. Please try again."
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

          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            AI Member Analysis
          </h2>

          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-600">
            Interpret observed training signals and identify
            possible next investigations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusStyles[routineStatus]
            }`}
          >
            {routineStatus}
          </span>

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
                : "Analyse Member"}
          </button>
        </div>
      </div>

      {!analysis && !isLoading && !error && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-[15px] leading-7 text-slate-600">
          Run the analysis to interpret this member's
          existing behavioural signals.
        </div>
      )}

      {isLoading && (
        <div
          role="status"
          className="mt-6 rounded-lg bg-slate-50 p-4"
        >
          <p className="text-[15px] font-medium text-slate-800">
            Analysing member behaviour...
          </p>
          <p className="mt-1 text-[15px] leading-7 text-slate-500">
            Generating decision support from synthetic data only.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <p className="text-[15px] font-medium text-red-800">
            Analysis failed
          </p>
          <p className="mt-1 text-[15px] leading-7 text-red-700">
            {error}
          </p>
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-5">
          {sections.map((section) => {
            const isAction = section.key === "suggestedAction"
            const isUnknown = section.key === "unknown"

            return (
              <div
                key={section.key}
                className={
                  isAction
                    ? "rounded-lg border-l-2 border-slate-700 bg-slate-50 px-4 py-4"
                    : "border-t border-slate-100 pt-5"
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-400">
                    {section.icon}
                  </span>

                  <h3
                    className={`text-[15px] font-semibold ${
                      isUnknown
                        ? "text-amber-800"
                        : "text-slate-900"
                    }`}
                  >
                    {section.title}
                  </h3>
                </div>

                <p className="mt-3 text-[15px] leading-8 text-slate-700">
                  {highlightFacts(analysis[section.key])}
                </p>
              </div>
            )
          })}

          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs leading-5 text-slate-500">
              AI-generated decision support · Synthetic member data ·
              Rules-based classification · Human review required
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
