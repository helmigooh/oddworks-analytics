# Oddworks Analytics
## AI Customer Health Copilot

Turn fragmented customer signals into clearer renewal-risk decisions.

Oddworks Analytics is a functional B2B SaaS prototype exploring how customer-health signals can be combined with AI-assisted interpretation to support Customer Success decisions.

The prototype separates:

- account health
- renewal urgency
- AI interpretation
- suggested human action

## The Problem

Customer Success teams often work across fragmented signals such as product usage, adoption, support activity and renewal timing.

The challenge is not simply to calculate a score, but to understand:

- which accounts may need attention
- why they may need attention
- how urgent the situation is
- what should be reviewed next

## Product Approach

The prototype follows a simple decision flow:

**Data → Health Signal → Risk Assessment → AI Interpretation → Suggested Action**

The underlying health model is rules-based and transparent.

AI is used only for interpretation and decision support.

## Health Model

Account health is derived from four signals:

- Seat utilisation
- Workflow adoption
- Usage trend
- Support activity

The application calculates a health score and maps it to:

- LOW
- MEDIUM
- HIGH

Renewal timing is deliberately treated separately as an urgency signal rather than part of account health.

This distinction is intentional:

**Health = How healthy is the account?**

**Urgency = How soon should someone review it?**

## AI Decision Support

The AI layer interprets only the supplied account signals.

It can:

- summarise account health
- identify key health drivers
- highlight renewal urgency
- suggest areas for human review

It must not:

- invent customer facts
- infer unsupported causes
- override the supplied health classification
- make autonomous customer or commercial decisions

Human review is always required.

## Example

A MEDIUM-health account may still require timely action if renewal is only 23 days away.

This allows the prototype to distinguish between underlying account health and the urgency of follow-up.

## Prototype Scope

The current version includes:

- Portfolio view with 8 synthetic B2B accounts
- Rules-based customer health scoring
- LOW / MEDIUM / HIGH risk classification
- Account-level signal breakdown
- Explainable health scoring
- Renewal urgency context
- Server-side OpenAI analysis
- Structured AI-generated decision support
- Human-in-the-loop guardrails
- Public deployment on Vercel

## Technology

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- Vercel
- GitHub

## Data

All account data in this prototype is synthetic.

The dataset is designed to demonstrate product logic, interaction patterns and decision-support concepts.

It is not intended to validate the health model statistically.

## What This Prototype Demonstrates

The project explores the intersection of:

- Digital Product
- Customer Health
- Analytics
- Requirements Definition
- Explainable decision logic
- AI-assisted decision support
- Rapid functional prototyping

The focus is not on production infrastructure, machine-learning model development or autonomous decision-making.

The focus is on product framing, decision logic, explainability, guardrails and usable decision support.

## Role / Contribution

Product framing · requirements · data model · decision logic · UX · AI guardrails · rapid functional prototyping

## Live Demo

https://oddworks-analytics.vercel.app/

## Repository

https://github.com/helmigooh/oddworks-analytics