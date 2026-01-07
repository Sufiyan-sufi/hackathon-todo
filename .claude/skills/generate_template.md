# Skill: generate_template

## Description
Output Markdown spec templates.

## Instructions
This skill generates structured Markdown templates for various specification and documentation artifacts in the Spec-Driven Development workflow.

## Available Templates

### 1. Feature Specification Template
```markdown
# Feature: [Feature Name]

## Overview
[Brief description of the feature]

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Functional Requirements
1. [Requirement 1]
2. [Requirement 2]

## Non-Functional Requirements
- Performance: [metrics]
- Security: [requirements]
- Scalability: [requirements]

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Out of Scope
- [Item 1]
- [Item 2]

## API Contracts (if applicable)
### Endpoint: [name]
- Method: [GET/POST/etc]
- Input: [schema]
- Output: [schema]
- Errors: [error codes]

## Data Models (if applicable)
[Schema definitions]

## Migration Strategy (if applicable)
[Migration approach]
```

### 2. Architecture Plan Template
```markdown
# Architecture Plan: [Feature Name]

## Scope and Dependencies
### In Scope
- [Item 1]

### Out of Scope
- [Item 1]

### External Dependencies
- [System/Service] - Owner: [team/person]

## Key Decisions and Rationale
### Decision 1: [Title]
- Options Considered: [A, B, C]
- Trade-offs: [pros/cons]
- Rationale: [reasoning]
- ADR: [link if created]

## Interfaces and API Contracts
### API: [name]
- Inputs: [schema]
- Outputs: [schema]
- Errors: [taxonomy]
- Versioning: [strategy]

## Non-Functional Requirements
### Performance
- p95 latency: [target]
- Throughput: [target]

### Reliability
- SLO: [target]
- Error budget: [percentage]

### Security
- AuthN/AuthZ: [approach]
- Data handling: [strategy]

### Cost
- Unit economics: [estimate]

## Data Management
- Source of Truth: [system]
- Schema Evolution: [strategy]
- Migration: [approach]
- Rollback: [strategy]

## Operational Readiness
### Observability
- Logs: [what to log]
- Metrics: [what to track]
- Traces: [what to trace]

### Alerting
- Thresholds: [values]
- On-call: [team/person]

### Deployment
- Strategy: [blue/green, canary, etc]
- Rollback: [procedure]

## Risk Analysis
### Risk 1: [description]
- Blast radius: [scope]
- Mitigation: [strategy]

## Validation
- Definition of Done: [criteria]
- Tests: [types and coverage]
```

### 3. Tasks Template
```markdown
# Tasks: [Feature Name]

## Task 1: [Title]
**Description:** [What needs to be done]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Test Cases:**
- [ ] [Test case 1]
- [ ] [Test case 2]

**Dependencies:** [Task IDs or none]

**Files to Modify:**
- [file path]

---

## Task 2: [Title]
[Repeat structure]
```

### 4. ADR Template
```markdown
# ADR-[NUMBER]: [Title]

**Date:** [YYYY-MM-DD]
**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Context:** [Feature/Project]

## Context
[What is the issue we're seeing that is motivating this decision or change?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
### Positive
- [Benefit 1]

### Negative
- [Trade-off 1]

### Neutral
- [Side effect 1]

## Alternatives Considered
### Option 1: [Name]
- Pros: [list]
- Cons: [list]
- Why rejected: [reason]

## Implementation Notes
[Technical details, migration strategy, rollback plan]

## References
- [Link to spec]
- [Link to related ADRs]
```

### 5. PHR Template
```markdown
---
id: [NUMBER]
title: "[Title]"
stage: [constitution|spec|plan|tasks|red|green|refactor|explainer|misc|general]
date: [YYYY-MM-DD]
surface: agent
model: [model-name]
feature: [feature-name or none]
branch: [branch-name]
user: [username]
command: [command-run]
labels: [topic1, topic2]
links:
  spec: [url or null]
  ticket: [url or null]
  adr: [url or null]
  pr: [url or null]
files:
  - [file1]
  - [file2]
tests:
  - [test1]
  - [test2]
---

# Prompt

[User's full input verbatim]

# Response

[Key assistant output]

# Outcome

[Result summary]

# Evaluation

[Reflection and learnings]
```

## Usage
Specify which template type you need:
- `generate_template spec` - Feature specification
- `generate_template plan` - Architecture plan
- `generate_template tasks` - Task breakdown
- `generate_template adr` - Architecture Decision Record
- `generate_template phr` - Prompt History Record

## Output
The skill will output the requested template in Markdown format, ready to be filled in with project-specific content.
