# ADR-0001: CLI Architecture Decision

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-05
- **Feature:** 001-cli-main
- **Context:** Need to establish a unified CLI entry point that integrates all 5 basic features (Add, Delete, Update, View, Mark Complete) in a single console loop for Phase I of the Todo application. The architecture must support in-memory storage while maintaining separation between presentation (CLI) and business logic (services).

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

- Architecture: Layered architecture with clear separation between CLI presentation layer and service business logic layer
- CLI Loop: Persistent REPL loop that maintains shared in-memory task list for the duration of the session
- Command Dispatch: Command parsing and routing mechanism that maps user commands to service functions
- Storage: In-memory Python list for Phase I (will be replaced with persistent storage in later phases)
- Error Handling: Centralized error handling in CLI layer that catches service exceptions and continues loop
- Service Functions: Reusable service functions (add, delete, update, view, mark_complete) that can be used by CLI and future API layer

## Consequences

### Positive

- Clear separation of concerns between presentation and business logic
- Reusable service functions that can be leveraged by future API/agent layers
- In-memory storage provides fast response times for Phase I requirements
- Centralized error handling prevents CLI from crashing on invalid inputs
- Persistent task list maintains state throughout CLI session
- Command dispatch pattern establishes foundation for future controller/router logic

### Negative

- In-memory storage means data is lost when CLI exits (Phase I limitation)
- Tight coupling between CLI and service layer through direct function calls
- Shared mutable state in task list could lead to concurrency issues in future multi-user scenarios
- Service functions directly print to stdout, limiting testability and reusability
- Error handling is CLI-specific and may not translate well to API responses

## Alternatives Considered

Alternative A: Direct implementation without service layer
- Approach: CLI directly manipulates Task objects without service abstraction
- Why rejected: Would create tight coupling and prevent reuse in future API layer

Alternative B: Event-driven architecture with message passing
- Approach: CLI and services communicate through events/messages instead of direct function calls
- Why rejected: Too complex for Phase I requirements, would add unnecessary overhead

Alternative C: Database-backed storage from the start
- Approach: Use SQLite or file-based storage instead of in-memory list
- Why rejected: Over-engineering for Phase I, would add complexity and dependencies

Alternative D: Separate CLI class with state management
- Approach: Object-oriented approach with CLI class maintaining its own state and methods
- Why rejected: Functional approach is simpler for this use case and aligns with Python best practices

## References

- Feature Spec: specs/001-cli-main/spec.md
- Implementation Plan: specs/001-cli-main/plan.md
- Related ADRs: none
- Evaluator Evidence: history/prompts/001-cli-main/1-cli-main-integration-tasks.tasks.prompt.md
