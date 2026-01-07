# Implementation Plan: CLI Main Integration

**Branch**: `001-cli-main` | **Date**: 2026-01-05 | **Spec**: [specs/001-cli-main/spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-cli-main/spec.md`

## Summary

Implement a single interactive CLI entry point that wires together every Phase I feature (add, delete, update, list/view, and complete/mark) inside one persistent REPL loop. The CLI will own the in-memory `tasks: list[Task]`, parse user commands using shlex for quote-aware input, validate arguments, and delegate to service-layer functions in `src/services`. The loop must survive malformed input, echo confirmations, and exit cleanly when users type `exit`/`quit`, providing the canonical interface for future API/agent phases.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Standard library (dataclasses, typing, sys, shlex), internal modules in `src.models` and `src.services`
**Storage**: In-memory Python list shared for the CLI session (Phase I requirement)
**Testing**: pytest for unit/service coverage plus scripted CLI acceptance runs (via `python -m src.cli.main`)
**Target Platform**: WSL2 Linux console (Ubuntu 22.04)
**Project Type**: Single-project monorepo (console app)
**Performance Goals**: Each command completes in <1s for up to 50 tasks (per spec SC-001)
**Constraints**: Must remain spec-driven with no manual persistence, reject malformed commands without crashing, reuse existing service functions without divergence, use shlex for quote-aware parsing
**Scale/Scope**: Single-user interactive session managing tens of tasks per run; foundation for future API/agent layers

## Constitution Check

- **Spec-Driven**: YES — plan derives directly from `specs/001-cli-main/spec.md` and the ratified constitution.
- **No Manual Edits**: YES — all code generation will flow through Spec Orchestrator + downstream agents; no hand-written patches allowed.
- **Reusable Intelligence**: Plan execution will use the Spec Orchestrator agent (primary) with the spec-refiner subagent and the `validate_spec` skill to guard quality gates.
- **AI-Native/Cloud-Native**: The CLI mirrors future controller/router flows, establishing command semantics that later map to API endpoints and MCP/agent intents.
- **Production-Grade**: YES — code stays fully type-hinted, includes docstrings/log hooks, and keeps observability-ready print/log statements for tracing.
- **Modular Evolution**: YES — command dispatch and task storage abstractions anticipate swapping the in-memory list for persistence and adding streaming/agent inputs in later phases.

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-main/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── (CLI command contract files to be generated this phase)
```

### Source Code (repository root)

```text
src/
├── cli/
│   └── main.py          # CLI entry point & REPL loop
├── models/
│   └── task.py          # Task dataclass with validation
├── services/
│   └── todo_service.py  # Business logic (add/delete/update/view/complete modules)
└── __init__.py

tests/
├── unit/
│   └── __init__.py      # pytest package; will house CLI parsing/service tests
└── integration/
    └── __init__.py      # placeholder for end-to-end CLI scenarios
```

**Structure Decision**: Continue using the single-project Spec-Kit layout already in `src/` and `tests/`. The CLI integrates existing service modules without introducing new packages, keeping Phase I changes localized to `src/cli/main.py` plus accompanying tests and documentation.

## Complexity Tracking

No constitution violations identified; additional complexity tracking not required for this feature.
