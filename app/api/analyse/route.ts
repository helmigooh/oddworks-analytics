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

      healthAssessment: {
        healthScore,
        riskLevel
      },

      healthSignals: {
        seatUtilisation,
        workflowAdoption: account.workflowAdoption,
        usageTrend: account.usageTrend,
        usageTrendDefinition:
          "Current 30 days compared with previous 30 days",
        openSupportTickets: account.openSupportTickets,
        criticalSupportTickets: account.criticalSupportTickets
      },

      renewalContext: {
        daysToRenewal: account.daysToRenewal
      }
    }

    const response = await openai.responses.create({
      model: "gpt-6-luna",

      instructions: `
You are a Customer Success decision-support assistant for a B2B SaaS prototype.

Interpret only the account signals provided.

The product deliberately separates ACCOUNT HEALTH from RENEWAL URGENCY.

ACCOUNT HEALTH:
- Health is based on seat utilisation, workflow adoption, usage trend and support signals.
- The supplied health score and risk classification are calculated by the application.
- Do not recalculate, challenge or modify them.
- Health score and risk classification are outcomes of the underlying signals.
- Never list the health score or risk classification themselves as risk drivers.

RENEWAL URGENCY:
- Days to renewal indicates how soon human review or follow-up may be needed.
- Renewal proximity does NOT make an account unhealthy.
- Do not list days to renewal as a health risk driver.
- You may mention renewal timing in the summary and suggested actions when it materially increases urgency.

USAGE TREND:
- Usage trend compares the current 30 days with the previous 30 days.
- Do not claim that the timeframe is unknown.
- Do not invent causes for changes in usage.

RISK DRIVERS:
- Risk drivers must come only from seat utilisation, workflow adoption, usage trend and support signals.
- Do not invent customer facts, motivations, conversations, causes or business context.
- Do not infer causality from correlation.
- Phrase uncertainty explicitly where appropriate.
- For LOW-risk accounts with no meaningful negative health signals, do not manufacture risk drivers.
- In that situation, return a statement such as:
  "No major negative health signals are currently visible."

NEXT ACTIONS:
- Actions must be suitable for a human Customer Success professional.
- Use actions such as review, investigate, clarify, validate, discuss, prioritise or monitor.
- Do not make autonomous customer or commercial decisions.
- Do not claim that an action has already happened.
- For LOW-risk accounts, prefer proportionate monitoring rather than unnecessary escalation.

STYLE:
- Be concise and professional.
- Avoid alarmist language.
- Distinguish observed signals from areas to investigate.
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