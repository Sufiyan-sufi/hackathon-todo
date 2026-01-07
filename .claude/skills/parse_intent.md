# Skill: parse_intent

## Description
Parse NL to commands.

## Instructions
This skill parses natural language (NL) user inputs into structured commands, intents, entities, and parameters for execution by AI agents, CLI tools, or application logic.

## Intent Parsing Overview

**What is Intent Parsing?**
Converting human language into machine-actionable commands by identifying:
1. **Intent:** What the user wants to do (action/goal)
2. **Entities:** Key information (objects, values, parameters)
3. **Context:** Additional information affecting interpretation
4. **Confidence:** How certain we are about the interpretation

## Core Components

### 1. Intent Classification

Map user input to predefined intents or actions.

**Examples:**

| User Input | Intent | Category |
|-----------|--------|----------|
| "add buy milk to my list" | `create_todo` | CRUD |
| "show me all completed tasks" | `list_todos` | Query |
| "mark task 5 as done" | `update_todo` | CRUD |
| "delete the first task" | `delete_todo` | CRUD |
| "what tasks are due today?" | `filter_todos` | Query |
| "help me understand how this works" | `get_help` | System |

### 2. Entity Extraction

Identify and extract key information from the input.

**Entity Types:**
- **Task Title:** "buy milk", "finish report"
- **Task ID:** "task 5", "the first task", "#123"
- **Status:** "completed", "done", "pending", "in progress"
- **Priority:** "high", "urgent", "low priority"
- **Date/Time:** "today", "tomorrow", "next Monday", "by 5pm"
- **Tags:** "#work", "#personal", "#urgent"
- **Quantity:** "first 5", "all", "task 3"

**Examples:**

```
Input: "add buy milk with high priority"
Intent: create_todo
Entities:
  - title: "buy milk"
  - priority: "high"

Input: "mark task 5 as completed"
Intent: update_todo
Entities:
  - task_id: 5
  - status: "completed"

Input: "show me tasks due tomorrow"
Intent: filter_todos
Entities:
  - due_date: "tomorrow"
```

### 3. Parameter Normalization

Convert extracted entities into structured parameters.

```python
from typing import Optional, List, Literal
from datetime import datetime, date
from pydantic import BaseModel, Field

class ParsedIntent(BaseModel):
    """Structured representation of parsed intent."""

    intent: str = Field(..., description="The identified intent/action")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")

    # Extracted entities
    entities: dict = Field(default_factory=dict, description="Raw extracted entities")

    # Normalized parameters
    params: dict = Field(default_factory=dict, description="Normalized parameters")

    # Context
    context: dict = Field(default_factory=dict, description="Additional context")

    # Original input
    raw_input: str = Field(..., description="Original user input")

class TodoIntent(BaseModel):
    """Specific intent for todo operations."""

    action: Literal["create", "read", "update", "delete", "list", "filter"]

    # Entity fields
    task_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["pending", "in_progress", "completed", "cancelled"]] = None
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = None
    due_date: Optional[date] = None
    tags: List[str] = Field(default_factory=list)

    # Query parameters
    filter_status: Optional[str] = None
    filter_priority: Optional[str] = None
    filter_date_range: Optional[tuple[date, date]] = None
    limit: Optional[int] = None
    offset: Optional[int] = None
```

## Parsing Strategies

### Strategy 1: Rule-Based Parsing

Use regex patterns and keyword matching for deterministic parsing.

```python
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

class RuleBasedParser:
    """Rule-based natural language parser."""

    # Intent patterns
    INTENT_PATTERNS = {
        "create_todo": [
            r"^(add|create|new)\s+(.+)",
            r"^(.+)\s+to\s+(my\s+)?(list|todos?)",
            r"^remind me to\s+(.+)",
        ],
        "list_todos": [
            r"^(show|list|display|get)\s+(all\s+)?(my\s+)?(tasks?|todos?)",
            r"^what('s|\s+are)\s+(my\s+)?(tasks?|todos?)",
        ],
        "update_todo": [
            r"^(mark|set|update)\s+(.+?)\s+as\s+(.+)",
            r"^complete\s+(.+)",
            r"^finish\s+(.+)",
        ],
        "delete_todo": [
            r"^(delete|remove|cancel)\s+(.+)",
        ],
        "filter_todos": [
            r"^(show|get)\s+(.+?)\s+(tasks?|todos?)",
        ],
    }

    # Status keywords
    STATUS_MAP = {
        "done": "completed",
        "finished": "completed",
        "complete": "completed",
        "completed": "completed",
        "pending": "pending",
        "todo": "pending",
        "in progress": "in_progress",
        "working on": "in_progress",
        "cancelled": "cancelled",
        "canceled": "cancelled",
    }

    # Priority keywords
    PRIORITY_MAP = {
        "urgent": "urgent",
        "asap": "urgent",
        "high": "high",
        "important": "high",
        "medium": "medium",
        "normal": "medium",
        "low": "low",
    }

    # Time expressions
    TIME_PATTERNS = {
        "today": lambda: datetime.now().date(),
        "tomorrow": lambda: (datetime.now() + timedelta(days=1)).date(),
        "next week": lambda: (datetime.now() + timedelta(weeks=1)).date(),
    }

    def parse(self, text: str) -> ParsedIntent:
        """Parse natural language input."""
        text = text.lower().strip()

        # Identify intent
        intent, confidence = self._identify_intent(text)

        # Extract entities
        entities = self._extract_entities(text, intent)

        # Normalize parameters
        params = self._normalize_params(entities)

        return ParsedIntent(
            intent=intent,
            confidence=confidence,
            entities=entities,
            params=params,
            raw_input=text
        )

    def _identify_intent(self, text: str) -> tuple[str, float]:
        """Identify the intent from text."""
        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.match(pattern, text, re.IGNORECASE):
                    return intent, 0.9

        # Default to create if no match
        return "create_todo", 0.5

    def _extract_entities(self, text: str, intent: str) -> Dict[str, Any]:
        """Extract entities based on intent."""
        entities = {}

        if intent == "create_todo":
            # Extract title
            match = re.search(r"(?:add|create|new)\s+(.+?)(?:\s+with|\s+as|\s+for|$)", text)
            if match:
                entities["title"] = match.group(1).strip()

            # Extract priority
            for keyword, priority in self.PRIORITY_MAP.items():
                if keyword in text:
                    entities["priority"] = priority
                    break

            # Extract due date
            for pattern, date_func in self.TIME_PATTERNS.items():
                if pattern in text:
                    entities["due_date"] = date_func()
                    break

            # Extract tags
            tags = re.findall(r"#(\w+)", text)
            if tags:
                entities["tags"] = tags

        elif intent == "update_todo":
            # Extract task ID
            match = re.search(r"task\s+#?(\d+)", text)
            if match:
                entities["task_id"] = int(match.group(1))
            else:
                # Try ordinal (first, second, etc.)
                match = re.search(r"(first|second|third|\d+(?:st|nd|rd|th))\s+task", text)
                if match:
                    entities["task_position"] = match.group(1)

            # Extract status
            for keyword, status in self.STATUS_MAP.items():
                if keyword in text:
                    entities["status"] = status
                    break

        elif intent == "delete_todo":
            # Extract task ID or position
            match = re.search(r"task\s+#?(\d+)", text)
            if match:
                entities["task_id"] = int(match.group(1))

        elif intent == "filter_todos":
            # Extract status filter
            for keyword, status in self.STATUS_MAP.items():
                if keyword in text:
                    entities["filter_status"] = status
                    break

            # Extract date filter
            for pattern, date_func in self.TIME_PATTERNS.items():
                if pattern in text:
                    entities["filter_date"] = date_func()
                    break

        return entities

    def _normalize_params(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize entities into clean parameters."""
        params = {}

        # Direct mapping
        for key in ["task_id", "title", "description", "status", "priority", "due_date", "tags"]:
            if key in entities:
                params[key] = entities[key]

        # Handle position-based references
        if "task_position" in entities:
            position = entities["task_position"]
            if position == "first":
                params["position"] = 0
            elif position == "second":
                params["position"] = 1
            # Could expand with more logic

        # Filter parameters
        if "filter_status" in entities:
            params["status"] = entities["filter_status"]
        if "filter_date" in entities:
            params["due_date"] = entities["filter_date"]

        return params
```

### Strategy 2: LLM-Based Parsing

Use language models for more flexible and context-aware parsing.

```python
from typing import Optional
import json

class LLMParser:
    """LLM-based natural language parser."""

    SYSTEM_PROMPT = """You are an intent parser for a todo application.
Parse user inputs into structured commands.

Available intents:
- create_todo: Add a new task
- list_todos: Show all tasks
- update_todo: Modify an existing task
- delete_todo: Remove a task
- filter_todos: Query tasks with filters

Extract entities:
- task_id: Task identifier (number)
- title: Task title/description
- status: pending, in_progress, completed, cancelled
- priority: low, medium, high, urgent
- due_date: ISO date format (YYYY-MM-DD)
- tags: List of tags (without #)

Respond with JSON only:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "entities": {...},
  "ambiguous": false
}
"""

    def __init__(self, llm_client):
        """Initialize with LLM client."""
        self.client = llm_client

    async def parse(self, text: str, context: Optional[Dict] = None) -> ParsedIntent:
        """Parse using LLM."""

        # Build prompt with context
        prompt = f"User input: {text}"
        if context:
            prompt += f"\nContext: {json.dumps(context)}"

        # Call LLM
        response = await self.client.chat(
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )

        # Parse response
        result = json.loads(response.content)

        return ParsedIntent(
            intent=result["intent"],
            confidence=result["confidence"],
            entities=result["entities"],
            params=self._normalize_params(result["entities"]),
            raw_input=text,
            context=context or {}
        )

    def _normalize_params(self, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize entities to parameters."""
        # Similar to rule-based normalization
        return entities
```

### Strategy 3: Hybrid Parsing

Combine rule-based and LLM parsing for best results.

```python
class HybridParser:
    """Hybrid parser combining rules and LLM."""

    def __init__(self, llm_client):
        self.rule_parser = RuleBasedParser()
        self.llm_parser = LLMParser(llm_client)

    async def parse(self, text: str, context: Optional[Dict] = None) -> ParsedIntent:
        """Parse using hybrid approach."""

        # Try rule-based first (fast)
        rule_result = self.rule_parser.parse(text)

        # If confidence is high, use rule-based result
        if rule_result.confidence >= 0.8:
            return rule_result

        # Otherwise, fall back to LLM (more accurate)
        llm_result = await self.llm_parser.parse(text, context)

        # Optionally merge results
        if rule_result.confidence > 0.5:
            # Use rule-based entities, LLM intent
            return ParsedIntent(
                intent=llm_result.intent,
                confidence=max(rule_result.confidence, llm_result.confidence),
                entities={**rule_result.entities, **llm_result.entities},
                params={**rule_result.params, **llm_result.params},
                raw_input=text,
                context=context or {}
            )

        return llm_result
```

## Example Parsing Flows

### Example 1: Simple Task Creation
```
Input: "add buy groceries"

Parse Result:
{
  "intent": "create_todo",
  "confidence": 0.95,
  "entities": {
    "title": "buy groceries"
  },
  "params": {
    "title": "buy groceries",
    "status": "pending",
    "priority": "medium"
  }
}

Execution:
POST /api/todos
{
  "title": "buy groceries",
  "status": "pending",
  "priority": "medium"
}
```

### Example 2: Complex Task with Metadata
```
Input: "add finish project report with high priority due tomorrow #work"

Parse Result:
{
  "intent": "create_todo",
  "confidence": 0.92,
  "entities": {
    "title": "finish project report",
    "priority": "high",
    "due_date": "2025-01-01",
    "tags": ["work"]
  },
  "params": {
    "title": "finish project report",
    "priority": "high",
    "due_date": "2025-01-01",
    "tags": ["work"]
  }
}

Execution:
POST /api/todos
{
  "title": "finish project report",
  "priority": "high",
  "due_date": "2025-01-01",
  "tags": ["work"]
}
```

### Example 3: Task Update
```
Input: "mark task 5 as completed"

Parse Result:
{
  "intent": "update_todo",
  "confidence": 0.98,
  "entities": {
    "task_id": 5,
    "status": "completed"
  },
  "params": {
    "task_id": 5,
    "status": "completed"
  }
}

Execution:
PATCH /api/todos/5
{
  "status": "completed"
}
```

### Example 4: Query with Filters
```
Input: "show me all high priority tasks due today"

Parse Result:
{
  "intent": "filter_todos",
  "confidence": 0.89,
  "entities": {
    "filter_priority": "high",
    "filter_date": "2024-12-31"
  },
  "params": {
    "priority": "high",
    "due_date": "2024-12-31"
  }
}

Execution:
GET /api/todos?priority=high&due_date=2024-12-31
```

## Handling Ambiguity

### Clarification System
```python
class AmbiguityResolver:
    """Resolve ambiguous intents with user clarification."""

    def detect_ambiguity(self, parsed: ParsedIntent) -> Optional[str]:
        """Detect if intent is ambiguous."""

        # Low confidence
        if parsed.confidence < 0.7:
            return "I'm not sure what you meant. Could you rephrase?"

        # Missing required entities
        if parsed.intent == "update_todo" and "task_id" not in parsed.entities:
            return "Which task would you like to update?"

        if parsed.intent == "create_todo" and "title" not in parsed.entities:
            return "What should the task be called?"

        # Multiple possible intents
        if "ambiguous" in parsed.context and parsed.context["ambiguous"]:
            return self._generate_clarification(parsed)

        return None

    def _generate_clarification(self, parsed: ParsedIntent) -> str:
        """Generate clarification question."""
        if "possible_intents" in parsed.context:
            intents = parsed.context["possible_intents"]
            return f"Did you want to: {', or '.join(intents)}?"

        return "Could you provide more details?"
```

## Intent Confidence Scoring

```python
def calculate_confidence(
    pattern_match: bool,
    entity_completeness: float,
    context_relevance: float
) -> float:
    """Calculate overall confidence score."""

    weights = {
        "pattern_match": 0.4,
        "entity_completeness": 0.4,
        "context_relevance": 0.2
    }

    score = (
        (1.0 if pattern_match else 0.0) * weights["pattern_match"] +
        entity_completeness * weights["entity_completeness"] +
        context_relevance * weights["context_relevance"]
    )

    return min(max(score, 0.0), 1.0)
```

## Context Management

```python
class ConversationContext:
    """Manage conversation context for better parsing."""

    def __init__(self):
        self.history: List[ParsedIntent] = []
        self.current_topic: Optional[str] = None
        self.mentioned_entities: Dict[str, Any] = {}

    def add_interaction(self, parsed: ParsedIntent):
        """Add interaction to context."""
        self.history.append(parsed)

        # Update current topic
        if parsed.intent:
            self.current_topic = parsed.intent

        # Track mentioned entities
        for key, value in parsed.entities.items():
            self.mentioned_entities[key] = value

    def resolve_reference(self, text: str) -> Optional[Any]:
        """Resolve pronouns and references."""

        # "it", "that task", etc.
        if any(word in text.lower() for word in ["it", "that", "this"]):
            if self.history:
                last_intent = self.history[-1]
                if "task_id" in last_intent.entities:
                    return last_intent.entities["task_id"]

        return None
```

## Testing Intent Parser

```python
import pytest

def test_create_todo_intent():
    parser = RuleBasedParser()

    result = parser.parse("add buy milk")

    assert result.intent == "create_todo"
    assert result.entities["title"] == "buy milk"
    assert result.confidence > 0.8

def test_update_todo_intent():
    parser = RuleBasedParser()

    result = parser.parse("mark task 5 as completed")

    assert result.intent == "update_todo"
    assert result.entities["task_id"] == 5
    assert result.entities["status"] == "completed"

def test_ambiguous_input():
    parser = RuleBasedParser()

    result = parser.parse("task 3")

    assert result.confidence < 0.7  # Ambiguous

@pytest.mark.asyncio
async def test_llm_parser():
    # Mock LLM client
    class MockLLM:
        async def chat(self, messages, temperature):
            return type('obj', (object,), {
                'content': '{"intent": "create_todo", "confidence": 0.95, "entities": {"title": "test"}}'
            })

    parser = LLMParser(MockLLM())
    result = await parser.parse("add test task")

    assert result.intent == "create_todo"
    assert result.confidence == 0.95
```

## Usage

### Parse User Input
```
parse_intent "add buy milk with high priority"
```

### Parse with Context
```
parse_intent "mark it as done" --context last_task_id=5
```

### Batch Parse
```
parse_intent --batch inputs.txt --output results.json
```

### Interactive Mode
```
parse_intent --interactive
```

## Output

The skill will:
1. Identify the intent/action
2. Extract all entities
3. Normalize parameters
4. Calculate confidence score
5. Detect ambiguity (if present)
6. Suggest clarifications (if needed)
7. Return structured ParsedIntent object

## Integration Example

```python
from fastapi import FastAPI, HTTPException
from parse_intent import HybridParser, ParsedIntent

app = FastAPI()
parser = HybridParser(llm_client)

@app.post("/chat")
async def chat_endpoint(message: str):
    """Handle natural language chat message."""

    # Parse intent
    parsed = await parser.parse(message)

    # Check confidence
    if parsed.confidence < 0.7:
        return {"response": "I'm not sure what you meant. Could you rephrase?"}

    # Execute based on intent
    if parsed.intent == "create_todo":
        todo = await create_todo(**parsed.params)
        return {"response": f"Created task: {todo.title}", "todo": todo}

    elif parsed.intent == "list_todos":
        todos = await list_todos(**parsed.params)
        return {"response": f"Found {len(todos)} tasks", "todos": todos}

    elif parsed.intent == "update_todo":
        todo = await update_todo(**parsed.params)
        return {"response": f"Updated task #{todo.id}", "todo": todo}

    else:
        raise HTTPException(status_code=400, detail="Unknown intent")
```

## Best Practices

1. **Start with rules, fall back to LLM** for best performance
2. **Always normalize entities** to consistent formats
3. **Track confidence scores** and request clarification when low
4. **Maintain conversation context** for reference resolution
5. **Handle edge cases** gracefully with defaults
6. **Test extensively** with real user inputs
7. **Log ambiguous cases** for continuous improvement
8. **Version your intent schemas** for backward compatibility
9. **Support multiple languages** if needed
10. **Provide helpful error messages** when parsing fails

## Notes

- Intent parsing is core to conversational AI systems
- Hybrid approach balances speed and accuracy
- Context awareness significantly improves accuracy
- Regular testing with real user data is essential
- Consider user experience when handling ambiguity
- Privacy: Be careful with logging user inputs
