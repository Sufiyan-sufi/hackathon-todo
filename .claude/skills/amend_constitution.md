# Skill: amend_constitution

## Description
Propose constitution amendments.

## Instructions
This skill guides the process of proposing, reviewing, and applying amendments to the project constitution. The constitution contains the core principles, standards, and policies that govern the project.

## Amendment Process

### 1. Identify Amendment Need
Amendments may be needed when:
- New patterns or standards emerge
- Existing principles conflict or are unclear
- Technology or architecture changes significantly
- Team feedback identifies gaps or issues
- Scaling requirements change

### 2. Draft Amendment Proposal
Structure the proposal as:

```markdown
## Amendment Proposal: [Title]

**Date:** [YYYY-MM-DD]
**Proposed by:** [Name/Role]
**Status:** [Draft | Under Review | Accepted | Rejected]

### Current State
[What the constitution currently says or lacks]

### Proposed Change
[Exact wording of the new or modified principle/standard]

### Rationale
[Why this change is needed]

### Impact Analysis
- **Affected Areas:** [List areas/teams/practices impacted]
- **Breaking Changes:** [Yes/No - describe if yes]
- **Migration Required:** [Yes/No - describe if yes]

### Benefits
- [Benefit 1]
- [Benefit 2]

### Risks/Trade-offs
- [Risk/Trade-off 1]
- [Risk/Trade-off 2]

### Implementation
- **Effective Date:** [When this takes effect]
- **Transition Plan:** [How to migrate existing code/practices]
- **Documentation Updates:** [What docs need updating]

### Examples
**Before:**
[Code or practice example under current constitution]

**After:**
[Code or practice example under proposed amendment]
```

### 3. Review Checklist
Before proposing, verify:
- [ ] Amendment aligns with project goals
- [ ] Language is clear and unambiguous
- [ ] Impact on existing work is understood
- [ ] Examples demonstrate the change
- [ ] Migration path is defined (if needed)
- [ ] Not in conflict with other principles
- [ ] Specific enough to be actionable
- [ ] General enough to be broadly applicable

### 4. Amendment Categories

#### Code Quality Amendments
- Naming conventions
- Code organization
- Documentation standards
- Testing requirements

#### Architecture Amendments
- Design patterns
- Technology choices
- System boundaries
- Integration patterns

#### Process Amendments
- Development workflow
- Review processes
- Deployment practices
- Quality gates

#### Security Amendments
- Security practices
- Data handling
- Authentication/Authorization
- Compliance requirements

#### Performance Amendments
- Performance targets
- Optimization guidelines
- Resource constraints
- Scaling principles

### 5. Submission Process
1. Draft the amendment using the template above
2. Save to: `.specify/proposals/amendments/[YYYY-MM-DD]-[slug].md`
3. Create a PHR documenting the proposal
4. Notify stakeholders for review
5. Address feedback and iterate
6. Once approved, update constitution
7. Archive the proposal with final status

### 6. Constitution Update
After approval:
1. Read current constitution: `.specify/memory/constitution.md`
2. Apply the amendment with clear version tracking
3. Add amendment history entry:
```markdown
## Amendment History

### [Date] - [Title]
- **Change:** [Brief description]
- **Rationale:** [Why]
- **Proposal:** [Link to proposal file]
```
4. Update any dependent templates or scripts
5. Communicate changes to team

## Usage

### Propose a New Amendment
```
amend_constitution propose "[amendment title]"
```

### Review Existing Proposals
```
amend_constitution review
```

### Apply Approved Amendment
```
amend_constitution apply "[amendment file]"
```

## Output
The skill will:
- Generate a structured amendment proposal
- Validate against constitution principles
- Check for conflicts with existing principles
- Create necessary documentation
- Track amendment history

## Example Amendments

### Example 1: Add Testing Standard
```markdown
## Amendment Proposal: Mandatory Unit Test Coverage

**Proposed Change:**
All new features must include unit tests with minimum 80% coverage for business logic.

**Rationale:**
Recent production issues stem from untested code paths.

**Impact:** All new features from [date] forward
```

### Example 2: Modify Naming Convention
```markdown
## Amendment Proposal: Update API Endpoint Naming

**Current State:**
No consistent naming convention for REST endpoints.

**Proposed Change:**
All REST endpoints must follow: `/api/v{version}/{resource}/{action}`

**Rationale:**
Improve API discoverability and consistency.
```

## Notes
- Amendments should be incremental, not revolutionary
- Seek consensus before enforcing breaking changes
- Document the "why" extensively
- Provide migration support for existing code
- Review amendments periodically for relevance
