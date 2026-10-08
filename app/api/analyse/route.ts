import OpenAI from "openai"
import {
  calculateHealthScore,
  calculateSeatUtilisation,
  getRiskLevel,
  type Account
} from "@/lib/health"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type AnalysisRequest = {
  account: Account
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalysisRequest
    const account = body.account

    if (!account) {
      return Response.json(
        { error: "Account data is required." },
        { status: 400 }
      )
    }

    const healthScore = calculateHealthScore(account)
    const riskLevel = getRiskLevel(healthScore)

    const seatUtilisation = Math.round(
      calculateSeatUtilisation(account)
    )

    const accountSignals = {
      accountName: account.name,
      arr: account.arr,
      healthScore,
      riskLevel,
      seatUtilisation,
      workflowAdoption: account.workflowAdoption,
      usageTrend: account.usageTrend,
      openSupportTickets: account.openSupportTickets,
      criticalSupportTickets: account.criticalSupportTickets,
      daysToRenewal: account.daysToRenewal
    }

    const response = await openai.responses.create({
      model: "gpt-6-luna",

      instructions: `
You are a Customer Success decision-support assistant for a B2B SaaS prototype.

Interpret only the account signals provided.

Rules:
- Do not invent customer facts, causes, motivations, conversations or business context.
- Do not infer causality from correlation.
- Do not change or recalculate the provided health score or risk classification.
- Distinguish observed signals from possible areas to investigate.
- Suggested actions must be framed for a human Customer Success professional.
- Be concise and professional.
- Avoid alarmist language.
- The output is decision support, not an autonomous decision.
`,

      input: `
Analyse this B2B SaaS account using only the supplied data:

${JSON.stringify(accountSignals, null, 2)}
`,

      text: {
        format: {
          type: "json_schema",
          name: "account_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string"
              },
              riskDrivers: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              nextActions: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            },
            required: [
              "summary",
              "riskDrivers",
              "nextActions"
            ],
            additionalProperties: false
          }
        }
      }
    })

    const analysis = JSON.parse(response.output_text)

    return Response.json(analysis)
  } catch (error) {
    console.error("AI analysis failed:", error)

    return Response.json(
      {
        error: "Unable to generate account analysis."
      },
      {
        status: 500
      }
    )
  }
}