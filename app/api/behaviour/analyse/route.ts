import OpenAI from "openai"
import { fitnessMembers } from "@/data/fitness-members"
import { assessRoutine } from "@/lib/routine"

// Reuse the existing server-side OpenAI configuration.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()

    const memberId =
      typeof body === "object" &&
      body !== null &&
      "memberId" in body &&
      typeof body.memberId === "string"
        ? body.memberId
        : null

    if (!memberId || !/^MEM-\d{3}$/.test(memberId)) {
      return Response.json(
        { error: "A valid member ID is required." },
        { status: 400 }
      )
    }

    const member = fitnessMembers.find(
      (item) => item.id === memberId
    )

    if (!member) {
      return Response.json(
        { error: "Member not found." },
        { status: 404 }
      )
    }

    // Deterministic assessment, not AI-generated.
    const assessment = assessRoutine(member)

    const signals = {
      memberId: member.id,
      observationPeriod: "First 90 days of membership",
      visitsByMonth: {
        month1: member.visitsByPeriod[0],
        month2: member.visitsByPeriod[1],
        month3: member.visitsByPeriod[2]
      },
      changeMonth2Percent: assessment.month2ChangePercent,
      changeMonth3Percent: assessment.changePercent,
      routineStatus: assessment.status,
      firstWarningMonth: assessment.firstWarningMonth,
      assessmentMethod: "Illustrative rules-based classification"
    }

    const response = await openai.responses.create({
      // Same model identifier as the existing V1.0 route.
      model: "gpt-6-luna",

      instructions: `
You are a Customer Insights decision-support assistant
for a synthetic fitness membership prototype.

Use ONLY the supplied behavioural signals.

ASSESSMENT:
- Routine status and percentages are calculated by the application.
- Do not modify, recalculate or challenge those values.
- At Risk means declining training activity,
  not proven cancellation or churn risk.
- Early warnings are retrospective, not real-time predictions.

EVIDENCE:
- Training visits describe behaviour, not motivation.
- Never invent member circumstances, goals, feedback,
  experiences, conversations or medical conditions.
- Do not assume missing motivation or dissatisfaction.
- Distinguish observed facts from possible explanations.
- Mention uncertainty explicitly.

RESEARCH:
- Suggest proportionate ways to investigate unclear reasons.
- Possible investigation areas include routine,
  expectations, training progress, support and barriers.
- Treat them as questions, never confirmed causes.

ACTIONS:
- Suggest only human-reviewed next steps.
- Do not claim contact or interventions already occurred.
- For stable members, avoid unnecessary escalation.

MEASUREMENT:
- Explain how a proposed intervention could be evaluated.
- Distinguish suggested measurement from actual results.
- Do not invent intervention outcomes or causal effects.

STYLE:
- Concise, professional and non-alarmist.
- One or two short sentences per field.
- Prefer direct wording over narrative wording.
- When describing visit patterns, prefer compact notation such as:
  "Visits: Month 1 8 → Month 2 4 → Month 3 0."
- Make the most important behavioural change easy to scan.
- Decision support only.
`,

      input: `
Analyse this synthetic member using only these signals:

${JSON.stringify(signals, null, 2)}
`,

      text: {
        format: {
          type: "json_schema",
          name: "member_behaviour_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              observed: {
                type: "string"
              },
              unknown: {
                type: "string"
              },
              researchOpportunity: {
                type: "string"
              },
              suggestedAction: {
                type: "string"
              },
              measurement: {
                type: "string"
              }
            },
            required: [
              "observed",
              "unknown",
              "researchOpportunity",
              "suggestedAction",
              "measurement"
            ],
            additionalProperties: false
          }
        }
      }
    })

    if (!response.output_text) {
      throw new Error("Empty AI response.")
    }

    const analysis = JSON.parse(response.output_text)

    return Response.json(analysis)

  } catch (error) {
    console.error("Fitness AI analysis failed:", error)

    return Response.json(
      {
        error: "Unable to generate member behaviour analysis."
      },
      { status: 500 }
    )
  }
}
