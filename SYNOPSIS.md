SOFTWARE PROJECT SYNOPSIS

Project Title  : Cognitive Canvas -- An AI-Powered Multi-Agent Idea Studio
Department     : Computer Science and Engineering
Institution    : [Your Institution Name]
Academic Year  : 2025-2026
Supervisor     : [Supervisor Name]
Date           : March 2026


------------------------------------------------------------------------
1. Introduction
------------------------------------------------------------------------

1.1 Purpose

This document presents the synopsis of Cognitive Canvas, a web-based AI
application that guides users through the complete lifecycle of startup
idea development -- from initial brainstorming to an investor-ready pitch
-- using five specialized AI agents on a visual, spatial canvas.

1.2 Document Conventions

Section headings use numeric notation (1, 1.1, 1.2 ...).
All agent names are capitalized (Brainstormer Agent, Critic Agent, etc.).
Technology names retain their official casing (React, FastAPI, Nginx).

1.3 Intended Audience and Reading Suggestions

  - Academic evaluators and project guides: read all sections.
  - Technical reviewers: focus on Sections 3, 4, and 5.
  - General readers: Sections 1 and 2 provide a complete overview.

1.4 Product Scope

Cognitive Canvas is a full-stack web application consisting of:

  - A React + TypeScript frontend with an infinite node-based canvas.
  - Five Python FastAPI microservices (AI agents) behind an Nginx gateway.
  - Integration with GPT-4 Turbo (via OpenRouter) and Cerebras Llama 3.1-8B.
  - Deployment on Render (backend) and Vercel (frontend).

The system is scoped to individual users and small teams performing
ideation, validation, and early-stage startup planning.


------------------------------------------------------------------------
2. Overall Description
------------------------------------------------------------------------

2.1 Product Perspective

Cognitive Canvas operates as a standalone web application. It integrates
with two external AI provider APIs (OpenRouter and Cerebras Cloud) and
requires no local AI installation. The system replaces a fragmented
multi-tool workflow (separate tools for brainstorming, planning, and
pitching) with a single unified platform.

2.2 Product Functions

The core functions of the system are:

  F1 -- Idea Generation    : Generate 3 startup ideas from a keyword and
                             a selected user persona.
  F2 -- Auto-Critique      : Automatically evaluate each idea (strengths,
                             challenges, recommendations).
  F3 -- Idea Expansion     : Apply one of 5 modes to an existing idea
                             (Expand, Merge, Analyze, Score, Refine).
  F4 -- Roadmap Generation : Produce a 3-phase strategic execution plan.
  F5 -- Task Breakdown     : Convert each roadmap phase into actionable
                             tasks with time and difficulty estimates.
  F6 -- Pitch Deck         : Generate an 8-slide investor pitch and export
                             it as a PDF.
  F7 -- Workspace Management: Save, load, and rename multiple canvases
                             using browser localStorage.

2.3 User Classes and Characteristics

  User Class      Description
  Student         Low budget, learning-oriented, time-sensitive projects.
                  Needs simple, achievable ideas with clear steps.
  Entrepreneur    Growth-focused, investment-aware, scalability-driven.
                  Needs comprehensive analysis and investor pitch.
  Hackathon       24-48 hour build constraint. Needs fast, buildable ideas
                  with concise tasks and realistic scope.

2.4 Operating Environment

  - Client: Any modern web browser (Chrome, Firefox, Edge, Safari).
  - Network: Standard HTTPS internet connection.
  - Backend: Docker containers on Render cloud (Linux, Python 3.9).
  - Frontend: Static site hosted on Vercel (CDN-delivered).
  - No local software installation required by the end user.

2.5 Design and Implementation Constraints

  - All AI calls depend on third-party APIs (OpenRouter, Cerebras).
    Downtime or rate limits on these services will affect availability.
  - Workspace data is stored in browser localStorage only; no server-side
    user accounts or persistence are included in this version.
  - Pitch deck export is client-side (jsPDF); complex layouts may vary
    across browsers.

2.6 User Documentation

  - README.md in the project repository covers local setup and deployment.
  - In-app tooltips and placeholder text guide first-time users.
  - No separate user manual is provided for this academic submission.

2.7 Assumptions and Dependencies

  - Valid API keys for OpenRouter and Cerebras are configured in the
    backend environment variables before deployment.
  - The user's browser supports the EventSource API (for SSE streaming).
  - Docker and Docker Compose are available for local development.


------------------------------------------------------------------------
3. External Interface Requirements
------------------------------------------------------------------------

3.1 User Interfaces

  - Infinite canvas with draggable, zoomable idea nodes (React Flow).
  - Right-click context menu on nodes to trigger agent actions.
  - Modal dialogs for input (keyword, persona selection, mode selection).
  - Real-time streaming output displayed inside node cards.
  - Zoom slider and reset controls in a fixed bottom panel.

3.2 Hardware Interfaces

  No dedicated hardware interfaces. Standard client devices (laptop,
  desktop) with internet access are sufficient.

3.3 Software Interfaces

  Interface         Type       Description
  OpenRouter API    REST/HTTPS GPT-4 Turbo for brainstorm, critique,
                               roadmap, and pitch generation.
  Cerebras Cloud    REST/HTTPS Llama 3.1-8B for fast task generation.
  jsPDF Library     Client JS  Converts pitch deck content to PDF.
  localStorage      Browser    Persists workspace data client-side.

3.4 Communications Interfaces

  - Frontend to Backend  : HTTP/HTTPS REST calls to the Nginx gateway on
                           port 8080 (local) or the Render service URL.
  - Streaming            : Server-Sent Events (SSE) for real-time token
                           delivery from each agent to the frontend.
  - Agent to AI APIs     : HTTPS requests with JSON payloads.


------------------------------------------------------------------------
4. System Features
------------------------------------------------------------------------

4.1 Multi-Agent AI Pipeline

The system routes requests through five specialized agents:

  Agent               Port   AI Model            Endpoint
  Brainstormer Agent  8001   GPT-4 Turbo         /brainstorm, /idea-engine
  Critic Agent        8002   GPT-4 Turbo         /criticize
  Roadmap Agent       8003   GPT-4 Turbo         /roadmap
  Task Agent          8004   Cerebras Llama 3.1  /tasks
  Pitch Deck Agent    8005   GPT-4 Turbo         /pitchdeck

All agents are independent FastAPI microservices behind an Nginx API
gateway. Responses are streamed to the frontend via SSE.

4.2 6-Mode Idea Engine

  Mode     Trigger              Output
  Keyword  Start Fresh          3 persona-tailored startup ideas
  Expand   Work with Idea       3 variations of the selected idea
  Merge    Work with Idea       1 hybrid idea combining two nodes
  Analyze  Work with Idea       Market size, competitors, go-to-market
  Score    Work with Idea       Rating on 5 dimensions (0-10 each)
  Refine   Work with Idea       Polished version of a rough concept

4.3 Visual Spatial Canvas

  - Nodes are positioned on an infinite, pannable, zoomable canvas.
  - Each agent output creates a new node connected to its source node.
  - Node types: Starting Point, Idea, Critique, Roadmap, Task, Pitch Deck.
  - Nodes can be repositioned freely by dragging.


------------------------------------------------------------------------
5. Nonfunctional Requirements
------------------------------------------------------------------------

5.1 Performance Requirements

  - Brainstormer response: first token within 3 seconds.
  - Task Agent response: complete output within 5 seconds (Cerebras speed).
  - Canvas interactions (pan, zoom, drag): below 100ms latency.
  - System should support at least 10 concurrent users without degradation.

5.2 Safety Requirements

  - No user-generated content is persisted on the server.
  - API keys are stored in server-side environment variables only; they
    are never exposed to the frontend or browser.

5.3 Security Requirements

  - All client-server communication uses HTTPS in production.
  - API keys are not hardcoded in any source file committed to the
    repository.
  - No user authentication is required; no personal data is collected.

5.4 Software Quality Attributes

  Attribute      Target
  Availability   99% uptime during academic evaluation period.
  Usability      New user can generate first idea within 2 minutes.
  Maintainability Each agent is independently deployable and replaceable.
  Portability    Runs on any machine with Docker installed.
  Scalability    Each agent can be scaled horizontally via Docker Compose.


------------------------------------------------------------------------
6. Project Plan
------------------------------------------------------------------------

6.1 Team Members

  Name         Role
  Somya Tambi  Full-stack development, AI agent integration, deployment
  Sojas Nayak  Frontend development, UI/UX design, documentation

6.2 Division of Work

  Area                            Assigned To
  Brainstormer + Critic agents    Somya Tambi
  Roadmap + Task + Pitch agents   Somya Tambi
  Nginx gateway + Docker setup    Somya Tambi
  React canvas + node components  Sojas Nayak
  Context menus + modals          Sojas Nayak
  PDF export + workspace panel    Sojas Nayak
  SRS and Synopsis documents      Both

6.3 Time Schedule

  Phase                          Duration        Status
  Requirements and design        Week 1-2        Completed
  Backend agent development      Week 3-5        Completed
  Frontend canvas development    Week 3-5        Completed
  Integration and testing        Week 6-7        Completed
  Deployment (Render + Vercel)   Week 8          Completed
  Documentation (SRS, Synopsis)  Week 9          Completed
  Final review and submission    Week 10         In Progress


------------------------------------------------------------------------
Appendix A: Glossary
------------------------------------------------------------------------

Term             Definition
Agent            An independent AI microservice responsible for one phase
                 of the idea development pipeline.
Canvas           The infinite spatial workspace where idea nodes are
                 created and connected.
SSE              Server-Sent Events. A technique for streaming data from
                 server to browser over a single HTTP connection.
Persona          A user profile (Student / Entrepreneur / Hackathon) that
                 customizes the tone and constraints of AI output.
Node             A card on the canvas representing one unit of AI output
                 (an idea, critique, roadmap, task list, or pitch deck).
GPT-4 Turbo      OpenAI language model accessed via OpenRouter API.
Cerebras         AI inference provider; used for ultra-fast task generation
                 with the Llama 3.1-8B model.
OpenRouter       API aggregator providing access to multiple AI models
                 through a single unified endpoint.
Nginx            Open-source web server used here as an API gateway to
                 route frontend requests to the correct backend agent.
Docker           Containerization platform used to package and deploy each
                 agent as an isolated, reproducible service.
