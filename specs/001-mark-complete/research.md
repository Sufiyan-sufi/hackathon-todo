# Research: Mark as Complete

**Feature**: Mark as Complete
**Phase**: 0 - Research & Best Practices
**Date**: 2026-01-04

## Research Findings

### Decision 1: Toggle Implementation Pattern

**Question**: What is the standard pattern for toggling boolean fields in Python?

**Decision**: Use direct boolean negation (`not` operator) to toggle `completed` field.

**Rationale**:
- Simple, idiomatic Python: `task.completed = not task.completed`
- No external dependencies required
- O(1) operation after task is found
- Clear and readable for future developers

**Alternatives considered**:
1. Set to explicit value (True/False based on check) - More verbose, requires conditional logic
2. Tri-state (completed/pending/in-progress) - Overkill for MVP spec requirements
3. Enum-based status - Unnecessary complexity for boolean requirement

**Relevant documentation**: PEP 8 style guide recommends simple, readable boolean operations

---

### Decision 2: Error Handling Pattern

**Question**: How to handle task ID not found error?

**Decision**: Raise `ValueError` with descriptive message, catch at CLI layer.

**Rationale**:
- `ValueError` is appropriate for invalid input values (non-existent ID)
- Allows CLI layer to catch and format error message for user
- Separates business logic (validation) from presentation (CLI output)
- Enables testing of error scenarios independently

**Alternatives considered**:
1. Return boolean (True=found, False=not found) - Requires caller to check return value
2. Print error directly from function - Violates separation of concerns
3. Use custom exception - Unnecessary for MVP

**Relevant documentation**: Python best practices for input validation

---

### Decision 3: List Search Strategy

**Question**: How to find task by ID in in-memory list?

**Decision**: Linear search using `next()` with generator expression.

**Rationale**:
- Simple implementation: `task = next((t for t in tasks if t.id == task_id), None)`
- O(n) complexity acceptable for Phase I (small in-memory lists)
- Pythonic and readable
- No need for optimization until Phase II (database indexed queries)

**Alternatives considered**:
1. Dictionary mapping (ID -> Task) - O(1) lookup but requires maintaining separate data structure
2. Binary search - Requires sorted list, unnecessary overhead
3. External libraries - Adds dependencies

**Future consideration**: In Phase II with database, this becomes a primary key lookup with O(1) or O(log n) complexity via database indexes.

---

### Decision 4: Confirmation Message Format

**Question**: What format for user feedback messages?

**Decision**: Simple f-string: "Task marked as {complete/incomplete}: ID {id} - {title}"

**Rationale**:
- Clear and user-friendly
- Shows all relevant information (status change, ID, title)
- Follows established pattern from other features (add_task confirmation)
- Easy to parse if needed for testing

**Alternatives considered**:
1. JSON output - Overkill for CLI
2. Separate success/error return codes - Unnecessary for MVP
3. Multi-line output - Too verbose for quick interactions

---

### Decision 5: Command Aliases

**Question**: How to support both `complete` and `mark` commands?

**Decision**: Accept either command name; both call same underlying function.

**Rationale**:
- User flexibility (different users prefer different terms)
- No code duplication (single function handles both)
- Easy to extend with additional aliases if needed

**Alternatives considered**:
1. Single command name - Less flexible
2. Separate functions for each - Code duplication
3. Configuration file - Unnecessary complexity for CLI

---

## Dependencies & Integrations

### External Dependencies

**Decision**: No external dependencies required for Phase I.

**Rationale**:
- Python 3.13+ standard library sufficient
- No database (in-memory)
- No web framework (CLI only)
- No authentication needed for Phase I

**Future considerations**:
- Phase II: Add FastAPI, SQLModel, Neon PostgreSQL
- Phase III: Add JWT authentication
- Phase IV: Add Docker, Kubernetes
- Phase V: Add Kafka, Dapr

### Testing Framework

**Decision**: Use pytest for unit and integration tests.

**Rationale**:
- Industry standard for Python testing
- Built-in fixture support
- Good test discovery and reporting
- Supports capsys for stdout testing (needed for confirmation messages)

**Alternatives considered**:
1. unittest - Built-in but less feature-rich
2. nose2 - Less popular, less maintained

---

## Summary

All research complete. No NEEDS CLARIFICATION items remain. Ready for Phase 1 (Design & Contracts).

Key decisions:
- Direct boolean negation for toggle
- ValueError for not-found errors
- Linear search for O(n) lookup (acceptable for in-memory Phase I)
- Simple f-string confirmation messages
- Command aliases via single function
- No external dependencies for Phase I
- pytest for testing
