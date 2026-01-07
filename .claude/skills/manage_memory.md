# Skill: manage_memory

## Description
Handle conversation memory.

## Instructions
This skill manages conversation memory for AI agents, chatbots, and interactive systems, including short-term context, long-term storage, entity tracking, and memory retrieval strategies.

## Memory Management Overview

**Why Conversation Memory?**
- Maintain context across multiple interactions
- Remember user preferences and history
- Enable natural follow-up questions
- Personalize responses
- Track entity state across conversations

**Memory Types:**
1. **Short-term (Working) Memory:** Current conversation context
2. **Long-term (Persistent) Memory:** Historical interactions and learned information
3. **Entity Memory:** Track mentioned entities (tasks, users, projects)
4. **Semantic Memory:** Store facts and knowledge
5. **Episodic Memory:** Remember specific past interactions

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Memory Manager                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Short-term  │  │  Long-term   │            │
│  │    Memory    │  │    Memory    │            │
│  │  (In-memory) │  │  (Database)  │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Entity     │  │   Semantic   │            │
│  │   Tracker    │  │    Index     │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────────────────────────┐          │
│  │      Memory Retrieval             │          │
│  │  (Similarity Search, Ranking)     │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

## Implementation

### 1. Memory Models

```python
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from uuid import UUID, uuid4

class MemoryEntry(BaseModel):
    """Single memory entry."""

    id: UUID = Field(default_factory=uuid4)
    session_id: str = Field(..., description="Conversation session ID")
    user_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

    # Content
    role: Literal["user", "assistant", "system"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")

    # Metadata
    intent: Optional[str] = None
    entities: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)

    # Memory attributes
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    access_count: int = Field(default=0)
    last_accessed: Optional[datetime] = None

    # Embeddings for semantic search
    embedding: Optional[List[float]] = None

class ConversationMemory(BaseModel):
    """Complete conversation memory state."""

    session_id: str
    user_id: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)

    # Short-term memory (recent messages)
    messages: List[MemoryEntry] = Field(default_factory=list)

    # Entity state
    entities: Dict[str, Any] = Field(default_factory=dict)

    # Conversation metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)

    # Summary of conversation so far
    summary: Optional[str] = None

class EntityMemory(BaseModel):
    """Track entities mentioned in conversation."""

    entity_id: str
    entity_type: str  # "task", "user", "project", etc.
    attributes: Dict[str, Any] = Field(default_factory=dict)

    first_mentioned: datetime = Field(default_factory=datetime.now)
    last_mentioned: datetime = Field(default_factory=datetime.now)
    mention_count: int = 0

    # Relations to other entities
    relations: Dict[str, List[str]] = Field(default_factory=dict)
```

### 2. Memory Manager

```python
from typing import Optional, List
import json

class MemoryManager:
    """Manages conversation memory."""

    def __init__(
        self,
        max_short_term_messages: int = 20,
        max_context_tokens: int = 4000,
        storage_backend = None,
        embedding_model = None
    ):
        self.max_short_term = max_short_term_messages
        self.max_tokens = max_context_tokens
        self.storage = storage_backend
        self.embedder = embedding_model

        # Active sessions (in-memory)
        self.sessions: Dict[str, ConversationMemory] = {}

    def get_or_create_session(
        self,
        session_id: str,
        user_id: Optional[str] = None
    ) -> ConversationMemory:
        """Get existing session or create new one."""

        if session_id not in self.sessions:
            # Try to load from storage
            if self.storage:
                loaded = self.storage.load_session(session_id)
                if loaded:
                    self.sessions[session_id] = loaded
                    return loaded

            # Create new session
            self.sessions[session_id] = ConversationMemory(
                session_id=session_id,
                user_id=user_id
            )

        return self.sessions[session_id]

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        entities: Optional[Dict] = None,
        importance: float = 0.5
    ) -> MemoryEntry:
        """Add message to conversation memory."""

        session = self.get_or_create_session(session_id)

        # Create memory entry
        entry = MemoryEntry(
            session_id=session_id,
            role=role,
            content=content,
            intent=intent,
            entities=entities or {},
            importance=importance
        )

        # Generate embedding for semantic search
        if self.embedder:
            entry.embedding = self.embedder.embed(content)

        # Add to short-term memory
        session.messages.append(entry)
        session.last_activity = datetime.now()

        # Update entity tracking
        if entities:
            self._update_entities(session, entities)

        # Manage memory size
        self._prune_memory(session)

        # Persist to long-term storage
        if self.storage:
            self.storage.save_entry(entry)

        return entry

    def get_context(
        self,
        session_id: str,
        max_messages: Optional[int] = None,
        include_summary: bool = True
    ) -> List[Dict[str, str]]:
        """Get conversation context for LLM."""

        session = self.get_or_create_session(session_id)

        messages = []

        # Add summary if available
        if include_summary and session.summary:
            messages.append({
                "role": "system",
                "content": f"Previous conversation summary: {session.summary}"
            })

        # Add recent messages
        recent = session.messages[-(max_messages or self.max_short_term):]
        for entry in recent:
            messages.append({
                "role": entry.role,
                "content": entry.content
            })

        return messages

    def _update_entities(self, session: ConversationMemory, entities: Dict):
        """Update entity tracking."""

        for entity_type, entity_data in entities.items():
            if isinstance(entity_data, dict):
                entity_id = entity_data.get("id") or entity_data.get("value")
            else:
                entity_id = str(entity_data)

            key = f"{entity_type}:{entity_id}"

            if key not in session.entities:
                session.entities[key] = EntityMemory(
                    entity_id=entity_id,
                    entity_type=entity_type,
                    attributes=entity_data if isinstance(entity_data, dict) else {}
                )
            else:
                entity_mem = session.entities[key]
                entity_mem.last_mentioned = datetime.now()
                entity_mem.mention_count += 1

                # Update attributes
                if isinstance(entity_data, dict):
                    entity_mem.attributes.update(entity_data)

    def _prune_memory(self, session: ConversationMemory):
        """Prune old messages from short-term memory."""

        if len(session.messages) > self.max_short_term:
            # Keep most important and recent messages
            to_archive = session.messages[:-self.max_short_term]

            # Generate summary of archived messages
            if len(to_archive) > 5:
                session.summary = self._summarize_messages(to_archive)

            # Remove from short-term
            session.messages = session.messages[-self.max_short_term:]

    def _summarize_messages(self, messages: List[MemoryEntry]) -> str:
        """Generate summary of message history."""
        # Could use LLM to generate summary
        # For now, simple extraction
        key_points = []
        for msg in messages:
            if msg.intent:
                key_points.append(f"- {msg.intent}: {msg.content[:50]}")

        return "\n".join(key_points[:5])

    def retrieve_relevant_memories(
        self,
        session_id: str,
        query: str,
        limit: int = 5
    ) -> List[MemoryEntry]:
        """Retrieve relevant memories using semantic search."""

        if not self.embedder or not self.storage:
            return []

        # Generate query embedding
        query_embedding = self.embedder.embed(query)

        # Search in long-term storage
        results = self.storage.similarity_search(
            session_id=session_id,
            query_embedding=query_embedding,
            limit=limit
        )

        return results

    def get_entity(
        self,
        session_id: str,
        entity_type: str,
        entity_id: str
    ) -> Optional[EntityMemory]:
        """Retrieve entity from memory."""

        session = self.get_or_create_session(session_id)
        key = f"{entity_type}:{entity_id}"
        return session.entities.get(key)

    def resolve_reference(
        self,
        session_id: str,
        reference: str
    ) -> Optional[EntityMemory]:
        """Resolve pronoun/reference to entity."""

        session = self.get_or_create_session(session_id)

        # Simple heuristic: return most recently mentioned entity
        if reference.lower() in ["it", "that", "this"]:
            # Find most recent entity
            entities_by_time = sorted(
                session.entities.values(),
                key=lambda e: e.last_mentioned,
                reverse=True
            )
            return entities_by_time[0] if entities_by_time else None

        return None

    def clear_session(self, session_id: str):
        """Clear session memory."""
        if session_id in self.sessions:
            del self.sessions[session_id]

        if self.storage:
            self.storage.archive_session(session_id)
```

### 3. Storage Backend

```python
from typing import List, Optional
import sqlite3
import json
import numpy as np

class SQLiteMemoryStorage:
    """SQLite-based memory storage."""

    def __init__(self, db_path: str = "memory.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize database schema."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_id TEXT,
                timestamp DATETIME NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                intent TEXT,
                entities TEXT,
                context TEXT,
                importance REAL,
                access_count INTEGER DEFAULT 0,
                last_accessed DATETIME,
                embedding BLOB
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_session_id
            ON memories(session_id)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp
            ON memories(timestamp)
        """)

        conn.commit()
        conn.close()

    def save_entry(self, entry: MemoryEntry):
        """Save memory entry to database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT OR REPLACE INTO memories
            (id, session_id, user_id, timestamp, role, content,
             intent, entities, context, importance, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(entry.id),
            entry.session_id,
            entry.user_id,
            entry.timestamp.isoformat(),
            entry.role,
            entry.content,
            entry.intent,
            json.dumps(entry.entities),
            json.dumps(entry.context),
            entry.importance,
            json.dumps(entry.embedding) if entry.embedding else None
        ))

        conn.commit()
        conn.close()

    def load_session(self, session_id: str) -> Optional[ConversationMemory]:
        """Load recent session history."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM memories
            WHERE session_id = ?
            ORDER BY timestamp DESC
            LIMIT 20
        """, (session_id,))

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return None

        messages = []
        for row in rows:
            entry = MemoryEntry(
                id=row[0],
                session_id=row[1],
                user_id=row[2],
                timestamp=datetime.fromisoformat(row[3]),
                role=row[4],
                content=row[5],
                intent=row[6],
                entities=json.loads(row[7]) if row[7] else {},
                context=json.loads(row[8]) if row[8] else {},
                importance=row[9],
                embedding=json.loads(row[11]) if row[11] else None
            )
            messages.append(entry)

        return ConversationMemory(
            session_id=session_id,
            messages=list(reversed(messages))
        )

    def similarity_search(
        self,
        session_id: str,
        query_embedding: List[float],
        limit: int = 5
    ) -> List[MemoryEntry]:
        """Search memories by embedding similarity."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Load all embeddings for session
        cursor.execute("""
            SELECT * FROM memories
            WHERE session_id = ? AND embedding IS NOT NULL
        """, (session_id,))

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return []

        # Calculate similarities
        results = []
        query_vec = np.array(query_embedding)

        for row in rows:
            embedding = json.loads(row[11])
            embedding_vec = np.array(embedding)

            # Cosine similarity
            similarity = np.dot(query_vec, embedding_vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(embedding_vec)
            )

            results.append((similarity, row))

        # Sort by similarity
        results.sort(reverse=True, key=lambda x: x[0])

        # Convert to MemoryEntry objects
        memories = []
        for similarity, row in results[:limit]:
            entry = MemoryEntry(
                id=row[0],
                session_id=row[1],
                user_id=row[2],
                timestamp=datetime.fromisoformat(row[3]),
                role=row[4],
                content=row[5],
                intent=row[6],
                entities=json.loads(row[7]) if row[7] else {},
                importance=row[9]
            )
            memories.append(entry)

        return memories
```

### 4. Vector Database Integration (Optional)

```python
from typing import List
import chromadb

class ChromaMemoryStorage:
    """ChromaDB-based vector storage for semantic search."""

    def __init__(self, collection_name: str = "conversation_memory"):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_memory(
        self,
        entry: MemoryEntry,
        embedding: List[float]
    ):
        """Add memory with embedding."""
        self.collection.add(
            ids=[str(entry.id)],
            embeddings=[embedding],
            documents=[entry.content],
            metadatas=[{
                "session_id": entry.session_id,
                "timestamp": entry.timestamp.isoformat(),
                "role": entry.role,
                "intent": entry.intent or "",
                "importance": entry.importance
            }]
        )

    def search(
        self,
        query_embedding: List[float],
        session_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict]:
        """Search memories by semantic similarity."""

        where = {"session_id": session_id} if session_id else None

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=where
        )

        return results
```

## Memory Strategies

### 1. Sliding Window
Keep only the N most recent messages.

```python
def sliding_window_memory(messages: List[MemoryEntry], window_size: int = 10):
    """Keep only recent messages."""
    return messages[-window_size:]
```

### 2. Token-Based Pruning
Keep messages within token budget.

```python
def token_based_memory(messages: List[MemoryEntry], max_tokens: int = 4000):
    """Keep messages within token budget."""
    total_tokens = 0
    result = []

    for msg in reversed(messages):
        msg_tokens = len(msg.content.split()) * 1.3  # Rough estimate
        if total_tokens + msg_tokens > max_tokens:
            break
        result.insert(0, msg)
        total_tokens += msg_tokens

    return result
```

### 3. Importance-Based Retention
Keep important messages even if old.

```python
def importance_based_memory(
    messages: List[MemoryEntry],
    limit: int = 20,
    importance_threshold: float = 0.7
):
    """Keep important messages and recent ones."""

    # Always keep high importance
    important = [m for m in messages if m.importance >= importance_threshold]

    # Fill remaining slots with recent messages
    recent = messages[-limit:]

    # Combine and deduplicate
    combined = {m.id: m for m in important + recent}
    return sorted(combined.values(), key=lambda m: m.timestamp)
```

### 4. Summarization Strategy
Summarize old conversations and keep summary.

```python
async def summarization_memory(
    messages: List[MemoryEntry],
    llm_client,
    summary_interval: int = 50
):
    """Summarize old messages periodically."""

    if len(messages) < summary_interval:
        return messages, None

    # Messages to summarize
    to_summarize = messages[:-20]

    # Generate summary
    summary_prompt = "Summarize the following conversation:\n\n"
    for msg in to_summarize:
        summary_prompt += f"{msg.role}: {msg.content}\n"

    summary = await llm_client.generate(summary_prompt)

    # Keep summary + recent messages
    return messages[-20:], summary
```

## Usage Examples

### Example 1: Basic Usage
```python
# Initialize memory manager
memory_manager = MemoryManager(
    max_short_term_messages=20,
    storage_backend=SQLiteMemoryStorage()
)

# Add messages
memory_manager.add_message(
    session_id="session_123",
    role="user",
    content="Add buy milk to my list",
    intent="create_todo",
    entities={"title": "buy milk"}
)

memory_manager.add_message(
    session_id="session_123",
    role="assistant",
    content="I've added 'buy milk' to your list.",
    importance=0.3
)

# Get context for next message
context = memory_manager.get_context("session_123")
```

### Example 2: Entity Tracking
```python
# User creates task
memory_manager.add_message(
    session_id="session_123",
    role="user",
    content="Create a high priority task for the project",
    entities={
        "task_id": 42,
        "priority": "high",
        "project": "Q4 Launch"
    }
)

# Later, user references it
entity = memory_manager.resolve_reference("session_123", "it")
# Returns task_id: 42
```

### Example 3: Semantic Search
```python
# Search for relevant memories
relevant = memory_manager.retrieve_relevant_memories(
    session_id="session_123",
    query="what tasks did I create yesterday?",
    limit=5
)

for memory in relevant:
    print(f"{memory.timestamp}: {memory.content}")
```

## Integration with Chatbot

```python
from fastapi import FastAPI, WebSocket

app = FastAPI()
memory_manager = MemoryManager()

@app.websocket("/chat/{session_id}")
async def chat_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    try:
        while True:
            # Receive message
            user_message = await websocket.receive_text()

            # Add to memory
            memory_manager.add_message(
                session_id=session_id,
                role="user",
                content=user_message
            )

            # Get conversation context
            context = memory_manager.get_context(session_id)

            # Generate response (using LLM with context)
            response = await generate_response(context)

            # Add response to memory
            memory_manager.add_message(
                session_id=session_id,
                role="assistant",
                content=response
            )

            # Send response
            await websocket.send_text(response)

    except WebSocketDisconnect:
        pass
```

## Best Practices

1. **Separate short-term and long-term memory** for performance
2. **Use embeddings for semantic search** of long-term memories
3. **Track entity state** across conversation
4. **Prune memory regularly** to stay within token limits
5. **Generate summaries** of old conversations
6. **Store importance scores** to retain key information
7. **Index by session and user** for efficient retrieval
8. **Encrypt sensitive information** in storage
9. **Implement memory expiration** for privacy
10. **Test memory retrieval accuracy** regularly

## Performance Considerations

### Memory Size
- Short-term: 10-20 messages (in-memory)
- Long-term: Unlimited (database)
- Token budget: 4000-8000 tokens for context

### Retrieval Speed
- In-memory lookup: < 1ms
- Database query: 10-50ms
- Vector search: 50-200ms

### Storage
- Text storage: ~1KB per message
- With embeddings: ~5KB per message
- Daily active user: ~100-500 messages

## Testing

```python
import pytest

@pytest.fixture
def memory_manager():
    return MemoryManager(max_short_term_messages=5)

def test_add_message(memory_manager):
    entry = memory_manager.add_message(
        session_id="test_session",
        role="user",
        content="Hello"
    )

    assert entry.content == "Hello"
    assert entry.role == "user"

def test_context_retrieval(memory_manager):
    # Add multiple messages
    for i in range(10):
        memory_manager.add_message(
            session_id="test_session",
            role="user",
            content=f"Message {i}"
        )

    context = memory_manager.get_context("test_session", max_messages=5)
    assert len(context) <= 5

def test_entity_tracking(memory_manager):
    memory_manager.add_message(
        session_id="test_session",
        role="user",
        content="Create task",
        entities={"task_id": 123}
    )

    entity = memory_manager.get_entity("test_session", "task_id", "123")
    assert entity is not None
    assert entity.mention_count == 1
```

## Notes

- Memory management is critical for long conversations
- Balance between context size and relevance
- Consider user privacy when storing conversations
- Implement data retention policies
- Use vector databases for large-scale deployments
- Monitor memory usage and performance
- Provide users with memory management controls (clear, export)
