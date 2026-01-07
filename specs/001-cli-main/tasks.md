# Implementation Tasks: CLI Main Integration

**Feature**: CLI Main Integration | **Branch**: `001-cli-main` | **Plan**: [specs/001-cli-main/plan.md](./plan.md)

## Overview

This document breaks down the implementation of the CLI Main Integration feature into testable, incremental tasks. The goal is to create a single interactive CLI entry point that integrates all 5 basic features (Add, Delete, Update, View, Mark Complete) in a persistent console loop with in-memory storage using shlex for quote-aware parsing.

## Phase 1: Setup (Project Initialization)

- [X] T001 Create project structure per implementation plan with CLI, models, and services directories
- [X] T002 Verify Python 3.13+ compatibility and standard library dependencies
- [X] T003 Set up basic testing infrastructure with pytest configuration

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Implement Task dataclass in src/models/task.py with validation (already exists, verify compliance)
- [X] T005 Implement shared task list management functions in src/services/
- [X] T006 [P] Implement add_task function in src/services/todo_service.py
- [X] T007 [P] Implement delete_task function in src/services/todo_service.py
- [X] T008 [P] Implement update_task function in src/services/todo_service.py
- [X] T009 [P] Implement view_tasks function in src/services/todo_service.py
- [X] T010 [P] Complete mark_complete function in src/services/todo_service.py (extend existing)

## Phase 3: [US1] Basic task management loop (Priority: P1)

- [X] T011 [US1] Create main CLI loop structure in src/cli/main.py with persistent task list
- [X] T012 [US1] Implement command parsing for add command in src/cli/main.py
- [X] T013 [US1] Implement add command handler that calls add_task service function
- [X] T014 [US1] Implement list/view command handler that calls view_tasks service function
- [X] T015 [US1] Implement exit/quit command handling with goodbye message
- [X] T016 [US1] Test basic add/list/exit functionality with independent test scenario

## Phase 4: [US2] Modify existing tasks in-session (Priority: P2)

- [X] T017 [US2] Implement delete command handler that calls delete_task service function
- [X] T018 [US2] Implement update command handler that calls update_task service function
- [X] T019 [US2] Add input validation for delete command (task ID validation)
- [X] T020 [US2] Add input validation for update command (task ID and new values)
- [X] T021 [US2] Test modify functionality with independent test scenario

## Phase 5: [US3] Track completion status (Priority: P3)

- [X] T022 [US3] Extend mark_complete function to support both complete and mark aliases
- [X] T023 [US3] Implement complete command handler that calls mark_complete service function
- [X] T024 [US3] Implement mark command handler that calls mark_complete service function
- [X] T025 [US3] Update task display format to show completion status ([X] or [ ])
- [X] T026 [US3] Test completion tracking functionality with independent test scenario

## Phase 6: Error Handling & Validation

- [X] T027 Implement command validation for unknown commands with helpful error messages
- [X] T028 Implement argument validation for malformed command inputs
- [X] T029 Implement task ID validation (non-integer, negative, non-existent IDs)
- [X] T030 Add exception handling to prevent CLI from crashing on invalid inputs
- [X] T031 Implement quoted string parsing using shlex for titles and descriptions with spaces

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T032 Add comprehensive docstrings to all CLI functions in src/cli/main.py
- [X] T033 Add type hints to all CLI functions and ensure full type safety
- [X] T034 Implement consistent user-friendly output formatting across all commands
- [X] T035 Add debug logging hooks for observability and tracing
- [X] T036 Create integration tests covering all command flows
- [X] T037 [P] Update __init__.py files to properly expose CLI module
- [X] T038 Verify all performance requirements (response under 1 second for up to 50 tasks)

## Dependencies

- **User Story 2** depends on foundational service functions being implemented (T006-T010)
- **User Story 3** depends on foundational service functions being implemented (T006-T010)

## Parallel Execution Examples

- Tasks T006-T010 can run in parallel as they implement different service functions
- Tasks T017-T018 can run in parallel as they implement different command handlers
- Tasks T023-T024 can run in parallel as they implement similar command handlers

## Implementation Strategy

- **MVP Scope**: Complete Phase 3 (User Story 1) first to establish the basic loop and core functionality
- **Incremental Delivery**: Each phase builds on the previous, with independent test criteria at each stage
- **Service Layer First**: Implement all service functions before CLI integration to ensure proper separation of concerns