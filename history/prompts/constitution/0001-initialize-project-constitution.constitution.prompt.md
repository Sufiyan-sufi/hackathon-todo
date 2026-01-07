---
id: 1
title: "Initialize Project Constitution"
stage: constitution
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: default
command: /sp.constitution
labels: [constitution, initialization, ai-native]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - .specify/templates/spec-template.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

Project Vision and Scope

Vision: Demonstrate the future of software development as AI-native, spec-first, and agent-oriented by evolving a simple Todo app from an in-memory console script to a distributed, event-driven, cloud-native AI chatbot on Kubernetes. This teaches the Nine Pillars of AI-Driven Development through hands-on implementation, not theory.

Scope: Implement the 5-phase progression (In-Memory Python Console App → Full-Stack Web App → AI-Powered Todo Chatbot → Local Kubernetes Deployment → Advanced Cloud Deployment). Include all Basic, Intermediate, and Advanced features (CRUD, priorities/tags, search/filter/sort, recurring tasks, due dates/reminders). Integrate a conversational AI interface for natural language task management (e.g., "Reschedule my morning meetings to 2 PM").

Learning Outcomes: Mastery of Spec-Driven Development (Claude Code + Spec-Kit Plus), Reusable Intelligence (agents, subagents, skills), Full-Stack (Next.js, FastAPI, SQLModel, Neon), AI Agents (OpenAI SDK, MCP SDK), Cloud-Native (Docker, Minikube, Helm, Kafka, Dapr, kubectl-ai, kagent), and Deployment Blueprints.

Core Principles

These principles are non-negotiable and supersede any conflicting guidance. They ensure alignment with the hackathon's AI-native focus.

1. Spec-Driven Development as Primary Source of Truth
Every feature, code generation, deployment, or change MUST start with a Markdown specification in /specs/. Specs must be refined iteratively until Claude Code generates accurate, functional output. No manual coding or edits are allowed—violations invalidate the phase. Use the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. Document all iterations in CLAUDE.md.
2. Reusable Intelligence Integration and Usage
Reusable intelligence is mandatory for efficiency, scalability, and bonus points (+200 for subagents/skills, +200 for cloud-native blueprints). Define and use agents, subagents, and skills as follows:

    *Agents and Subagents: Main agents (e.g., Spec Orchestrator, Code Generator) orchestrate workflows and delegate to subagents (e.g., Python Architect, NLP Parser) for specialized tasks. Stored in .claude/agents/ as Markdown prompts. Invoke via Claude Code (e.g., "As Code Generator Agent, use Python Architect Subagent to generate CRUD code"). Minimum: 3 main agents with subagents per major domain.
    *Skills: Atomic, reusable tools (e.g., validate_spec, generate_helm_chart) for common operations, stored in .claude/skills/ as Markdown templates or MCP/kagent definitions. Agents/subagents MUST invoke skills when applicable (e.g., "Invoke skill parse_intent on user input"). Skills enable tool use, memory layering, and orchestration. Transition to MCP SDK for Phase III+ and kagent ToolServers for Phase IV+.
    *Mandate: Actively use at least one agent/subagent and skill per feature implementation. Extract patterns (e.g., spec validation) into reusable artifacts early. This principle governs all phases to build "reusable intelligence instead of one-off code."

3. Progressive Evolution and Future-Proofing
Each phase builds incrementally on the previous with minimal refactoring. Design Phase I (in-memory) to anticipate Phase II persistence, Phase III AI, and Phase IV/V deployments. Use modular, agent-oriented architectures for seamless scaling.
4. AI-Native and Cloud-Native Alignment
Leverage AI for all generation (Claude Code) and runtime (OpenAI Agents, MCP, kagent). Ensure cloud-native practices: containerization, orchestration, event-driven (Kafka/Dapr), AIOps (kubectl-ai/kagent). Prioritize spec-to-component workflows, intent-driven agents, and blueprints for automated infrastructure.
5. Production-Grade Excellence
Generated code must be clean, type-safe (full hints), secure (JWT from Phase II), observable (logging), and deployable. Follow PEP 8, clean code principles, and proper structure. User experiences (CLI, web, chatbot) must be intuitive with clear indicators.

Key Standards and Guidelines

Monorepo Organization: Follow Spec-Kit structure: .spec-kit/config.yaml, specs/ (overview.md, architecture.md, features/, api/, database/, ui/), CLAUDE.md, frontend/ (Next.js), backend/ (FastAPI), docker-compose.yml. Use UV for Python deps.

Technology Stack Adherence: As specified per phase. Authentication: Better Auth + JWT for user isolation (shared secret via env var). API: RESTful with user_id filtering.

Feature Implementation: Basic (Add/Delete/Update/View/Mark Complete), Intermediate (Priorities/Tags, Search/Filter, Sort), Advanced (Recurring Tasks, Due Dates/Reminders with notifications).

Security and Privacy: Enforce token-based auth, user data isolation, no shared DB sessions. All endpoints require valid JWT post-Phase I.

Documentation and Traceability: GitHub repo with constitution, specs history, /src, README.md (setup), CLAUDE.md (prompts/iterations). Demo videos <90s.

Bonus Standards: Implement reusable intelligence (agents/subagents/skills), cloud-native blueprints (Helm/kagent), Urdu support (chatbot), voice commands (speech input).

Development Environment: WSL 2 (Ubuntu 22.04) for Windows; Python 3.13+.

Constraints

No Manual Interventions: Code generation only via spec and Claude Code. Refine specs to resolve issues.

Resource Limits: No additional tools beyond specified stack. Internet access limited to approved APIs (e.g., Neon, OpenAI).

Ethical Constraints: Assume good intent; no disallowed activities as per safety instructions.

Success Criteria

Phase Deliverables: All phases complete, functional, and spec-driven. Integrated chatbot in III-V; deployments on Minikube (IV) and DOKS (V).

Reusable Intelligence Demonstration: Agents, subagents, and skills used and documented, claiming +400 bonuses minimum.

Quality Verification: Judges confirm no manual code, full traceability via specs/CLAUDE.md, and alignment with this Constitution.

Bonus Achievement: All +600 points via exceptional features (reusable intelligence, blueprints, Urdu, voice).

Overall Impact: Project excels, potentially leading to Panaversity interview. Final system is AI-native, scalable, and teachable.

## Response snapshot

Project constitution initialized to v1.0.0. Core principles (SDD, Reusable Intelligence, Evolution, AI/Cloud Alignment, Excellence) established. Plan, Spec, and Task templates updated for synchronization. CLAUDE.md guidelines appended with mandatory compliance rules.

## Outcome

- ✅ Impact: High. Established the project "Source of Truth" and SDD workflow.
- 🧪 Tests: n/a
- 📁 Files: constitution.md, plan-template.md, spec-template.md, tasks-template.md, CLAUDE.md
- 🔁 Next prompts: Use /sp.specify to start the Phase I feature spec.
- 🧠 Reflection: Automated template synchronization ensures the agent follows the constitution from the very next prompt.

## Evaluation notes (flywheel)

- Failure modes observed: Initial todo list tool failure due to parameter name mismatch.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Generate first feature spec.
