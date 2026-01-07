---

description: "Task list for Mark as Complete feature implementation"
---

# Tasks: Mark as Complete

**Input**: Design documents from `/specs/001-mark-complete/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests specified in feature specification for Phase I. Tests can be added if user requests TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- This is a Phase I in-memory Python console application

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure: src/models/, src/services/, src/cli/, tests/unit/, tests/integration/
- [X] T002 Create empty __init__.py files in src/, src/models/, src/services/, src/cli/, tests/, tests/unit/, tests/integration/
- [X] T003 [P] Create pyproject.toml with pytest dependency for Python 3.13+

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Task model with id, title, description, completed fields in src/models/task.py (using dataclass from data-model.md)
- [X] T005 Implement type hints for Task model: id: int, title: str, description: str = "", completed: bool = False
- [X] T006 [P] Create todo_service.py structure with empty function stub in src/services/todo_service.py
- [X] T007 [P] Create main.py CLI structure with command parsing stub in src/cli/main.py
- [X] T008 Configure docstrings for all stubbed functions per constitution requirements

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Mark task as complete (Priority: P1) 🎯 MVP

**Goal**: Enable users to toggle task completion status by ID using `complete` or `mark` commands

**Independent Test**: Add a task, run `complete 1`, verify status changes to completed with confirmation message. Run `mark 1` again, verify status toggles to incomplete.

### Implementation for User Story 1

- [X] T009 [US1] Implement mark_complete function in src/services/todo_service.py with signature (tasks: list[Task], task_id: int) -> None
- [X] T010 [US1] Add linear search logic using next() and generator expression to find task by ID in mark_complete function
- [X] T011 [US1] Add ValueError raising when task ID not found with message "Task ID not found: {task_id}"
- [X] T012 [US1] Add boolean toggle logic (task.completed = not task.completed) in mark_complete function
- [X] T013 [US1] Add print confirmation message "Task marked as {complete/incomplete}: ID {task_id} - {task.title}" after successful toggle
- [X] T014 [US1] Add docstring to mark_complete function explaining behavior, parameters, and errors per PEP 8
- [X] T015 [US1] Import Task model and mark_complete function in src/cli/main.py
- [X] T016 [US1] Add command parsing logic to handle "complete <id>" and "mark <id>" commands in src/cli/main.py
- [X] T017 [US1] Add try-except block in CLI layer to catch ValueError and display error message to user
- [X] T018 [US1] Add integer validation for ID parameter in CLI command parsing (reject non-numeric inputs)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can mark tasks complete/incomplete with confirmation messages.

---

## Phase 4: User Story 2 - Handle non-existent task ID (Priority: P2)

**Goal**: Provide clear error messages when users try to mark non-existent task IDs

**Independent Test**: Run `complete 999` on empty task list, verify "Task ID not found: 999" message displayed without crashing.

### Implementation for User Story 2

- [X] T019 [US2] Enhance mark_complete function to check if task list is empty and provide specific error message "No tasks available to mark"
- [X] T020 [US2] Add zero/negative ID validation in mark_complete function (treat as not found)
- [X] T021 [US2] Update CLI layer to display user-friendly error message for ValueError from mark_complete
- [X] T022 [US2] Add input validation in CLI parsing to reject negative IDs with message "Invalid task ID: {id}"

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. All edge cases handled gracefully.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T023 [P] Review and update docstrings for all functions to ensure they follow constitution observability requirements
- [X] T024 [P] Add type hints validation - ensure all functions have complete type hints per FR-001
- [X] T025 Run quickstart.md validation examples to confirm all user scenarios work as documented
- [X] T026 [P] Code cleanup - remove any unused imports, ensure PEP 8 formatting compliance
- [X] T027 Validate all success criteria from spec.md:
  - SC-001: Marking completes in under 1 second
  - SC-002: 100% correct confirmation messages
  - SC-003: 100% error handling for invalid IDs
  - SC-004: 100% correct toggle behavior on consecutive calls

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories should proceed sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion (builds on same mark_complete function)

### Within Each User Story

- Models in Foundational phase before user story tasks
- mark_complete function implementation before CLI integration
- Core implementation before validation/error handling

### Parallel Opportunities

- Setup tasks T002 and T003 can run in parallel
- Foundational tasks T006 and T007 can run in parallel (within Phase 2)
- Polish tasks T023, T024, T026 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Can run in parallel after T009 (mark_complete function exists):
Task: T010 [US1] Add linear search logic in mark_complete function
Task: T014 [US1] Add docstring to mark_complete function

# Can run in parallel after CLI integration done:
Task: T023 [P] Review and update docstrings
Task: T024 [P] Add type hints validation
Task: T026 [P] Code cleanup
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T009-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo: Add task, mark complete, mark incomplete, verify confirmation messages

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP!)
3. Add User Story 2 → Test independently → Demo (Full feature!)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 1 and 2 are NOT independent - US2 builds on US1's mark_complete function
- Each phase checkpoint represents a deployable increment
- Stop at User Story 1 checkpoint to validate MVP before proceeding to US2
- All functions must have type hints and docstrings per constitution requirements
