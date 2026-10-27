# Oddworks Analytics

**AI-assisted Customer Health & Behaviour Insights**

Oddworks Analytics is a functional, publicly accessible prototype exploring how behavioural signals, transparent rules and AI-assisted interpretation can support better customer and product decisions.

**Core principle: Rules establish the assessment. AI supports interpretation. Humans make the decisions.**

## Explore the live demos

| Use case | Question | Demo |
| --- | --- | --- |
| **Customer Health Copilot** (B2B SaaS) | Which accounts may need attention, and why? | [Open account portfolio](https://oddworks-analytics.vercel.app/) |
| **Behaviour Insights** (fitness membership, v1.2) | When do new members' training routines start to change, and what should we investigate? | [Open training routine overview](https://oddworks-analytics.vercel.app/behaviour) |

Both use cases use **synthetic data**. They are independent demonstrations, not connected to live customer systems.

## Product approach

The prototype connects **behavioural evidence, product thinking, research questions and decision support**:

**Signals → Explainable assessment → Unknowns / hypotheses → Human action → Measurement → Learning**

The aim is not to replace judgement with a score. It is to make changes in behaviour visible, show what can and cannot be concluded, and help frame the next useful decision.

## Use case 1: Customer Health Copilot

### The question

Customer Success teams often work across fragmented signals such as product usage, adoption, support activity and renewal timing. Which accounts need attention, what is driving the assessment, and how urgent is a review?

### How it works

- A portfolio of **8 synthetic B2B accounts**, with account-level detail views.
- Transparent, rules-based **health scoring and LOW / MEDIUM / HIGH risk classification**.
- Four health signals: **seat utilisation, workflow adoption, usage trend and support activity**.
- **Renewal urgency is assessed separately from account health**. A healthy account may still need a timely renewal review.
- "Why this rating?" explains the underlying assessment rather than treating the score itself as a risk driver.
- On-demand AI interpretation summarises available signals and suggests areas for human review.

**Illustrative distinction:** A medium-health account with renewal in 23 days may need attention soon, without that timing making the account less healthy.

[Explore the B2B case](https://oddworks-analytics.vercel.app/)

## Use case 2: Behaviour Insights (v1.2)

### The question

**Why do some new fitness members lose their training routine?**

This independent case was developed from a customer-insights interview exercise. It demonstrates how an ambiguous business question can become a small, testable decision-support experience. It does **not** use real fitness-company or member data, and is not affiliated with a fitness operator.

### Synthetic cohort and behavioural signals

- **100 synthetic members** across **8 fictional demo clubs**.
- First **90 days of membership**, divided into three consecutive 30-day periods.
- Check-in / visit counts compared with **each member's own initial routine**, not with an arbitrary universal visit target.
- Three explainable states: **Stable, Declining, At Risk**.
- Sortable overview and individual member details showing visits, percentage change and the reasoning behind the classification.

The current rules are illustrative: a decline of **20% or more** from the first period marks a meaningful warning; the Month 3 assessment is **Declining** from a 20% drop and **At Risk** from a 50% drop. These thresholds are not statistically validated.

### Example: from change to possible action

**Member 011:** **Month 1: 8 → Month 2: 4 → Month 3: 0** visits.

- A **50% decline** was already observable at the **end of Month 2**.
- By the end of Month 3, the decline against the initial routine is **100%** and the member is classified **At Risk**.
- That describes **attendance behaviour**, not a proven reason, cancellation intention or churn prediction.
- A reasonable next step might be a human-reviewed check-in or training review to explore possible barriers, without presuming any cause.

In contrast, **Member 001** goes from **12 → 12 → 11** visits and is classified **Stable**; the product does not call for unnecessary intervention.

**Early warning here is retrospective:** it indicates when a rule would have been triggered at the end of a completed period. It is not a real-time alert or predictive model.

### Research, intervention and measurement

The member view distinguishes between:

- **Observed behaviour:** What actually changed in the synthetic visit records?
- **Unknowns:** What cannot be inferred about motivation, experience, goals or circumstances?
- **Research opportunities:** What should be explored with members and club teams?
- **Possible human action:** What low-pressure intervention might be worth testing?
- **Measurement and guardrails:** How could training frequency and routine stability be compared over a defined follow-up period, alongside member feedback and staff effort?

**Stable members can be useful research references** for understanding different patterns and experiences. They are **not automatically a suitable control group** for assessing an intervention offered to declining-routine members. That requires a comparable group with similar declining patterns and no intervention (or another credible evaluation design).

[Explore Behaviour Insights](https://oddworks-analytics.vercel.app/behaviour) · [Example: Member 011](https://oddworks-analytics.vercel.app/behaviour/MEM-011)

## AI Decision Support and guardrails

Both use cases offer **on-demand, server-side OpenAI analysis**. The application calculates the health/routine classification first; AI does not assign or override the status.

In the fitness case, the structured response separates:

1. **Observed Behaviour**
2. **What We Don't Know**
3. **Research Opportunity**
4. **Suggested Action**
5. **Measurement**

The prompts require the AI to use only supplied synthetic signals, state uncertainty, avoid inventing customer motivations or medical explanations, and never claim an intervention has already happened or worked. Suggested actions require **human review**.

## What this prototype is — and is not

**It is:**

- An independent **product / analytics / UX proof of concept**.
- An example of turning ambiguous customer questions into usable requirements, explainable behavioural rules and decision support.
- A demonstration of AI-assisted functional prototyping and responsible interpretation.

**It is not:**

- A production-ready customer platform or integrated CRM/CDP/analytics system.
- A trained predictive or machine-learning model.
- A validated churn model, a causal study or evidence that an intervention works.
- A source of real customer, member or Fitness First / LifeFit Group data.

## Technology

- **Next.js**, **React**, **TypeScript**, **Tailwind CSS**
- **OpenAI API** (server-side, on demand)
- **Vercel** for hosting and deployment
- **GitHub** for version control

Core application files include:

```text
app/page.tsx                         B2B account overview
app/accounts/[id]/page.tsx           B2B account detail
app/api/analyse/route.ts             B2B AI analysis
app/behaviour/page.tsx               Fitness behaviour overview
app/behaviour/[id]/page.tsx          Fitness member detail
app/api/behaviour/analyse/route.ts   Fitness AI analysis
data/fitness-members.ts              Synthetic fitness cohort
lib/routine.ts                       Explainable routine rules
components/MemberAnalysis.tsx       Fitness AI interface
```

### Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. To use the on-demand AI analysis locally, provide an `OPENAI_API_KEY` through a local `.env.local` file. **Never commit API keys or `.env.local`.**

```bash
npm run build
npm audit --omit=dev
```

## Role and contribution

**Product framing · customer and behavioural signals · requirements · rules-based assessment · UX / information hierarchy · research and experimentation thinking · AI guardrails · AI-assisted prototyping**

The focus is on structuring ambiguous problems and making evidence useful for decisions, **not** on claiming data-science, ML engineering or full-stack engineering expertise.

## Links

- **Live application:** https://oddworks-analytics.vercel.app/
- **Behaviour Insights:** https://oddworks-analytics.vercel.app/behaviour
- **Repository:** https://github.com/helmigooh/oddworks-analytics
