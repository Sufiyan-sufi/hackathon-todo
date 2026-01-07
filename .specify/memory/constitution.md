<!--
Sync Impact Report:
- Version change: [INITIAL] -> 1.0.0
- List of modified principles:
  - [ALL_PLACEHOLDERS] -> [AI_NATIVE_PRINCIPLES]
- Added sections:
  - Phase Deliverables
  - Development Environment
  - Technology Stack
- Added principles:
  - I. Spec-Driven Development (SDD) as Primary Source of Truth
  - II. Reusable Intelligence Integration and Usage
  - III. Progressive Evolution and Future-Proofing
  - IV. AI-Native and Cloud-Native Alignment
  - V. Production-Grade Excellence
- Templates requiring updates:
  - .specify/templates/plan-template.md (⚠ pending)
  - .specify/templates/spec-template.md (⚠ pending)
  - .specify/templates/tasks-template.md (⚠ pending)
- Follow-up TODOs:
  - Integrate kagent/ToolServer guidance once in Phase IV.
-->
# AI-Native Hackathon Todo Constitution

## Project Vision and Scope

**Vision**: Demonstrate the future of software development as AI-native, spec-first, and agent-oriented by evolving a simple Todo app from an in-memory console script to a distributed, event-driven, cloud-native AI chatbot on Kubernetes. This project focuses on implementing the Nine Pillars of AI-Driven Development through hands-on implementation.

**Scope**: Implement a 5-phase progression from an in-memory console app to an advanced cloud-native deployment. Features include full CRUD, priorities, tags, search, filtering, recurring tasks, and an AI conversational interface for natural language task management.

## Core Principles

### I. Spec-Driven Development (SDD) as Primary Source of Truth
Every feature, code generation, deployment, or change MUST start with a Markdown specification in `/specs/`. Specs must be refined iteratively until accurate, functional output is generated. No manual coding or direct edits to generated code are allowed.
- **Workflow**: Write spec → Generate plan → Break into tasks → Implement via agent tools.
- **Rationale**: Ensures AI-native alignment and maintainability through a rigorous spec-first approach.

### II. Reusable Intelligence Integration and Usage
Mandatory use of agents, subagents, and skills for efficiency and scalability.
- **Agents/Subagents**: Main agents (Orchestrators) delegate to specialized subagents (Architects, Parsers). Prompts stored in `.claude/agents/`.
- **Skills**: Atomic, reusable tools stored in `.claude/skills/`. Transition to MCP SDK in Phase III+ and kagent ToolServers in Phase IV+.
- **Mandate**: Every feature must use at least one agent/subagent and one skill.

### III. Progressive Evolution and Future-Proofing
Each phase builds incrementally on the previous with minimal refactoring.
- **Design**: Phase I (in-memory) must anticipate Phase II persistence, Phase III AI, and Phase IV/V deployments.
- **Architecture**: Use modular, agent-oriented architectures for seamless scaling.

### IV. AI-Native and Cloud-Native Alignment
Leverage AI for both generation (Claude Code) and runtime (OpenAI Agents, MCP, kagent).
- **Practices**: Containerization, orchestration (K8s), event-driven (Kafka/Dapr), and AIOps.
- **Focus**: Spec-to-component workflows and automated infrastructure via blueprints.

### V. Production-Grade Excellence
Generated code must be clean, type-safe (PEP 8 for Python), secure, observable, and deployable.
- **Security**: JWT-based authentication from Phase II onwards.
- **Quality**: Clean code principles, proper module structure, and intuitive user experiences.

## Technology Stack and Requirements

- **Monorepo Structure**: Follow Spec-Kit organization (frontend/backend/specs/history).
- **Backend**: FastAPI with SQLModel and Neon (PostgreSQL).
- **Frontend**: Next.js.
- **Authentication**: Better Auth + JWT.
- **Deployment**: Docker, Minikube (Phase IV), DigitalOcean K8s (Phase V).
- **Infrastructure**: Kafka, Dapr, Helm charts.

## Development Environment
- **Platform**: WSL 2 (Ubuntu 22.04) on Windows.
- **Runtime**: Python 3.13+.
- **Dependency Management**: UV.

## Governance

- **Manual Edits**: Strictly prohibited for generated code. Failures must be fixed by refining the specification.
- **Compliance**: All PRs and tasks must be validated against this constitution.
- **Amendments**: Amendments require a documentation update, version bump, and migration plan if needed.

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
