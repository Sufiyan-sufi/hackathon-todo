# Feature Specification: CLI Main Integration (Refined)

**Feature Branch**: `001-cli-main`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "Implement the main CLI entry point that integrates all 5 basic features (Add, Delete, Update, View, Mark Complete) in a single console loop. This unifies the app for Phase I, using in-memory storage. Refinement: Improve input parsing for multi-word titles/descriptions without mandatory quotes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic task management loop (Priority: P1)

As a user, I want a single CLI session where I can add tasks with multi-word titles/descriptions, view my list, and exit so that I can manage todos without restarting the app.

**Why this priority**: Provides the minimum viable experience that demonstrates the app working end-to-end in one console loop with improved parsing.

**Independent Test**: Run the CLI, enter `add "Buy Milk Today"`, then `list`, confirm the new task appears with the full title, and exit with `quit`.

**Acceptance Scenarios**:

1. **Given** the CLI starts with no tasks, **When** I enter `add "Buy Milk Today" "2% for coffee"`, followed by `list`, **Then** the system outputs confirmation and shows the task with ID 1 and both title and description properly parsed.

2. **Given** I have finished adding tasks, **When** I enter `exit`, **Then** the CLI stops and prints "Goodbye" (or equivalent friendly message).

---

### User Story 2 - Modify existing tasks in-session (Priority: P2)

As a user, I want to delete or update tasks during the same CLI session so that I can correct or remove entries immediately, with support for multi-word titles/descriptions.

**Why this priority**: Editing and deleting are the next most common actions after creating and viewing tasks, with improved parsing support.

**Independent Test**: Add a task with multi-word title/description, update its title via `update <id>`, delete it via `delete <id>`, then run `list` to verify changes.

**Acceptance Scenarios**:

1. **Given** task ID 1 exists with multi-word title, **When** I run `update 1 "Buy Almond Milk Now" "Unsweetened version"`, **Then** the CLI outputs an update confirmation and the next `list` shows the new values properly parsed.

2. **Given** task ID 1 exists, **When** I run `delete 1`, **Then** the CLI outputs "Task deleted: ID 1 - …" and the next `list` omits the task.

---

### User Story 3 - Track completion status (Priority: P3)

As a user, I want to mark tasks complete/incomplete from the CLI so that I can track progress without switching tools.

**Why this priority**: Completion toggling is the final basic feature required for Phase I parity.

**Independent Test**: Add a task, run `complete <id>`, confirm the status flips in `list`, then run `mark <id>` to toggle back.

**Acceptance Scenarios**:

1. **Given** task ID 2 is incomplete, **When** I run `complete 2`, **Then** the CLI outputs "Task marked as complete: ID 2 - …" and `list` shows `[X]`.

2. **Given** task ID 2 is complete, **When** I run `mark 2`, **Then** the CLI outputs "Task marked as incomplete: ID 2 - …" and `list` shows `[ ]`.

---

### Edge Cases

- Unknown command keyword (e.g., `foo 1`): CLI MUST respond with "Unknown command" and list supported commands.
- Missing or malformed arguments (e.g., `update 1` without title): CLI MUST show usage guidance without crashing.
- Non-integer IDs or negative numbers: CLI MUST reject with "Invalid task ID" messages before calling services.
- Persistent in-memory list: Tasks added earlier in the session MUST remain available for subsequent commands until exit.
- Quote-aware parsing: CLI MUST use `shlex` to properly handle quoted strings for titles and descriptions with spaces.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CLI MUST initialize a shared `tasks: list[Task]` that persists for the duration of the session.
- **FR-002**: CLI MUST implement a `main() -> None` loop that continually prompts with `"> "` until the user enters `exit` or `quit`.
- **FR-003**: CLI MUST parse commands (`add`, `delete`, `update`, `list`/`view`, `complete`/`mark`, `exit`/`quit`) and dispatch to the corresponding service functions defined in `src/services/`.
- **FR-004**: CLI MUST use `shlex.split` for quote-aware input parsing (e.g., `add Meeting today` works as title="Meeting today", desc=""). For update, first arg ID, second new_title (join if multi), rest new_desc (join). Handle optional desc.
- **FR-005**: CLI MUST catch `ValueError` (or broader exceptions) from services, print user-friendly messages, and continue the loop without terminating.
- **FR-006**: CLI MUST echo confirmations from service calls (e.g., "Task added", "Task deleted") or display results from `list/view` in the format defined by the View Task feature.

### Key Entities

- **Task List (in-memory)**: Shared list of `Task` objects loaded at CLI startup (initially empty). Acts as the working data store for all commands.
- **Command Parser**: Logical component (function or block) that interprets user input strings using `shlex` to properly handle quoted strings and multi-word arguments before invoking services.

## Evolution & Intelligence *(mandatory for AI-Native)*

- **Current Phase**: Phase I – In-Memory Python Console App.
- **Future Alignment**: CLI structure will later be replaced by API + frontend, but the command dispatch pattern mirrors future controller/router logic. The shared task list will map to a repository or database session in Phase II.
- **Agent/Skill Targets**: Continues to rely on Spec Orchestrator Agent and `validate_spec` skill for subsequent refinements. The CLI integration will inform future MCP/kagent interfaces by defining canonical command semantics.

## Non-Functional Requirements *(AI/Cloud-Native focus)*

- **Security**: Inputs are local; however, CLI MUST sanitize and validate to prevent crashes (defense against malformed strings).
- **Observability**: Each command path MUST include docstrings and optional debug logging hooks to aid tracing in later phases.
- **Performance**: Each command MUST complete within 1 second for up to 50 tasks (O(n) scans acceptable in-memory).
- **Portability**: CLI MUST run under Python 3.13+ on WSL2; no OS-specific dependencies allowed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can execute at least five consecutive commands (mix of add/update/delete/list/complete) without restarting the CLI, with responses under 1 second each.
- **SC-002**: 95% of malformed command inputs result in a descriptive error message without terminating the session.
- **SC-003**: After any command, the in-memory task list reflects the expected state (verified by `list/view`) 100% of the time.
- **SC-004**: Exit command (`exit` or `quit`) terminates the loop cleanly in 100% of test runs, printing a farewell message.
- **SC-005**: Quote-aware parsing handles multi-word titles and descriptions correctly in 100% of test cases using both quoted and unquoted inputs.