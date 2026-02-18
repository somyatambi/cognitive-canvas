# Brainstormer Agent - API Usage Guide

## Overview
The Brainstormer Agent now features the **Cognitive Canvas Idea Engine** with 6 powerful modes for startup idea generation, analysis, and refinement.

## API Endpoint
**POST** `/generate` or `/brainstorm`

## Request Format
```json
{
  "prompt": "Your input text",
  "mode": "keyword|expand|merge|analyze|score|refine",
  "persona": "student|entrepreneur|hackathon",
  "secondary_input": "Second idea for merge mode (optional)"
}
```

## Modes

### 1. 🔑 KEYWORD MODE
Generate 3 unique startup ideas from a keyword.

**Request:**
```json
{
  "prompt": "AI",
  "mode": "keyword",
  "persona": "hackathon"
}
```

**Output:** 3 ideas approaching the keyword from different angles (Product/Tool, Service/Platform, Content/Community)

---

### 2. 🌿 EXPAND MODE
Branch out from an existing idea into 3 spin-offs.

**Request:**
```json
{
  "prompt": "AI-powered resume builder",
  "mode": "expand",
  "persona": "student"
}
```

**Output:** 3 pivots (Different Audience, Different Format, Adjacent Problem)

---

### 3. 🔀 MERGE MODE
Combine two ideas into one powerful hybrid.

**Request:**
```json
{
  "prompt": "AI chatbot for customer support",
  "mode": "merge",
  "persona": "entrepreneur",
  "secondary_input": "Blockchain loyalty rewards platform"
}
```

**Output:** Hybrid idea with synergy breakdown, target user, revenue model, and MVP plan

---

### 4. 📊 ANALYZE MODE
Get market analysis, competitors, and go-to-market strategy.

**Request:**
```json
{
  "prompt": "AI-powered code review tool for teams",
  "mode": "analyze",
  "persona": "entrepreneur"
}
```

**Output:** Competitor landscape, unfair advantage, market potential, GTM strategy

---

### 5. 🏆 SCORE MODE
Evaluate and rank ideas across 5 dimensions.

**Request:**
```json
{
  "prompt": "Notion template marketplace for students | AI essay grading tool | Campus event finder app",
  "mode": "score",
  "persona": "student"
}
```

**Output:** Scorecard for each idea (Feasibility, Uniqueness, Market Demand, Scalability, Speed to MVP) with ranking

---

### 6. ✨ REFINE MODE
Transform a rough idea into a polished, actionable concept.

**Request:**
```json
{
  "prompt": "like an app where people can share their ideas and get feedback maybe with ai or something",
  "mode": "refine",
  "persona": "hackathon"
}
```

**Output:** Clear elevator pitch, core features, target user, revenue model, tech stack, and first step

---

## Personas

### 🎓 STUDENT
- Budget: $0-200
- Time: 10-15 hrs/week
- Focus: Simple tech, campus-relevant
- Goal: First revenue in 2-4 weeks

### 💼 ENTREPRENEUR
- Budget: Can invest capital
- Time: 30+ hrs/week
- Focus: High-growth potential ($100k+ revenue)
- Goal: B2B/SaaS scalability

### ⚡ HACKATHON (Default)
- Time: 24-48 hours
- Focus: Impressive demo, working prototype
- Goal: Win judges, wow factor

---

## Backward Compatibility

Legacy format still supported:
```json
{
  "prompt": "[PERSONA:student] Generate ideas about education"
}
```

## Example cURL Commands

**Keyword Mode:**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "sustainability",
    "mode": "keyword",
    "persona": "entrepreneur"
  }'
```

**Merge Mode:**
```bash
curl -X POST http://localhost:8000/brainstorm \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "AI fitness coach",
    "mode": "merge",
    "persona": "hackathon",
    "secondary_input": "Gamified habit tracker"
  }'
```

**Refine Mode:**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "something with blockchain and gaming",
    "mode": "refine",
    "persona": "student"
  }'
```

---

## Response Format
All responses are **streamed** in real-time as plain text. The format follows the structured output specified for each mode in the MASTER_IDEA_ENGINE_PROMPT.

## Tips for Best Results
1. Be specific with your input
2. Use the right mode for your need
3. Choose the persona that matches your context
4. For merge mode, provide two distinct ideas
5. For score mode, separate multiple ideas with `|`
