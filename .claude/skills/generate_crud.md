# Skill: generate_crud

## Description
Generate CRUD boilerplate code.

## Instructions
This skill generates complete CRUD (Create, Read, Update, Delete) boilerplate code for various frameworks and architectures, following project constitution and best practices.

## Supported Architectures

### 1. REST API (Python/FastAPI)
### 2. REST API (Node.js/Express)
### 3. GraphQL API
### 4. Database Models (SQLAlchemy, Prisma, etc.)
### 5. Frontend Components (React, Vue, etc.)

## CRUD Generation Process

### Step 1: Gather Requirements
Before generating, collect:
- **Resource Name:** (e.g., "User", "Product", "Order")
- **Fields:** Name, type, constraints, defaults
- **Relationships:** Foreign keys, associations
- **Validations:** Required fields, formats, ranges
- **Business Rules:** Custom logic, computed fields
- **Security:** Authentication, authorization rules

### Step 2: Generate Structure

#### Database Model Template (Python/SQLAlchemy)
```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from database import Base

class {{ResourceName}}(Base):
    __tablename__ = "{{table_name}}"

    id = Column(Integer, primary_key=True, index=True)
    {{#fields}}
    {{field_name}} = Column({{field_type}}, {{constraints}})
    {{/fields}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<{{ResourceName}}(id={self.id})>"
```

#### Pydantic Schema Template (FastAPI)
```python
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class {{ResourceName}}Base(BaseModel):
    {{#fields}}
    {{field_name}}: {{field_type}} = Field({{field_config}})
    {{/fields}}

class {{ResourceName}}Create({{ResourceName}}Base):
    pass

class {{ResourceName}}Update(BaseModel):
    {{#fields}}
    {{field_name}}: Optional[{{field_type}}] = None
    {{/fields}}

class {{ResourceName}}Response({{ResourceName}}Base):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
```

#### Repository/Service Template
```python
from sqlalchemy.orm import Session
from typing import List, Optional
from models import {{ResourceName}}
from schemas import {{ResourceName}}Create, {{ResourceName}}Update

class {{ResourceName}}Repository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: {{ResourceName}}Create) -> {{ResourceName}}:
        """Create a new {{resource_name}}"""
        db_obj = {{ResourceName}}(**data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def get_by_id(self, id: int) -> Optional[{{ResourceName}}]:
        """Get {{resource_name}} by ID"""
        return self.db.query({{ResourceName}}).filter({{ResourceName}}.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[{{ResourceName}}]:
        """Get all {{resource_name}}s with pagination"""
        return self.db.query({{ResourceName}}).offset(skip).limit(limit).all()

    def update(self, id: int, data: {{ResourceName}}Update) -> Optional[{{ResourceName}}]:
        """Update {{resource_name}} by ID"""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """Delete {{resource_name}} by ID"""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return False

        self.db.delete(db_obj)
        self.db.commit()
        return True
```

#### API Router Template (FastAPI)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import {{ResourceName}}Create, {{ResourceName}}Update, {{ResourceName}}Response
from repositories import {{ResourceName}}Repository

router = APIRouter(prefix="/{{resource_plural}}", tags=["{{resource_plural}}"])

@router.post("/", response_model={{ResourceName}}Response, status_code=status.HTTP_201_CREATED)
def create_{{resource_name}}(
    data: {{ResourceName}}Create,
    db: Session = Depends(get_db)
):
    """Create a new {{resource_name}}"""
    repo = {{ResourceName}}Repository(db)
    return repo.create(data)

@router.get("/{id}", response_model={{ResourceName}}Response)
def get_{{resource_name}}(
    id: int,
    db: Session = Depends(get_db)
):
    """Get {{resource_name}} by ID"""
    repo = {{ResourceName}}Repository(db)
    obj = repo.get_by_id(id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{{ResourceName}} with id {id} not found"
        )
    return obj

@router.get("/", response_model=List[{{ResourceName}}Response])
def list_{{resource_plural}}(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all {{resource_plural}} with pagination"""
    repo = {{ResourceName}}Repository(db)
    return repo.get_all(skip=skip, limit=limit)

@router.put("/{id}", response_model={{ResourceName}}Response)
def update_{{resource_name}}(
    id: int,
    data: {{ResourceName}}Update,
    db: Session = Depends(get_db)
):
    """Update {{resource_name}} by ID"""
    repo = {{ResourceName}}Repository(db)
    obj = repo.update(id, data)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{{ResourceName}} with id {id} not found"
        )
    return obj

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_{{resource_name}}(
    id: int,
    db: Session = Depends(get_db)
):
    """Delete {{resource_name}} by ID"""
    repo = {{ResourceName}}Repository(db)
    if not repo.delete(id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{{ResourceName}} with id {id} not found"
        )
    return None
```

#### Test Template
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_{{resource_name}}():
    """Test creating a {{resource_name}}"""
    response = client.post(
        "/{{resource_plural}}/",
        json={{
            {{#fields}}
            "{{field_name}}": {{test_value}},
            {{/fields}}
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    {{#fields}}
    assert data["{{field_name}}"] == {{test_value}}
    {{/fields}}

def test_get_{{resource_name}}():
    """Test getting a {{resource_name}} by ID"""
    # Create first
    create_response = client.post("/{{resource_plural}}/", json={...})
    created_id = create_response.json()["id"]

    # Get
    response = client.get(f"/{{resource_plural}}/{created_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created_id

def test_list_{{resource_plural}}():
    """Test listing {{resource_plural}}"""
    response = client.get("/{{resource_plural}}/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_update_{{resource_name}}():
    """Test updating a {{resource_name}}"""
    # Create first
    create_response = client.post("/{{resource_plural}}/", json={...})
    created_id = create_response.json()["id"]

    # Update
    response = client.put(
        f"/{{resource_plural}}/{created_id}",
        json={"{{field_name}}": {{new_value}}}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["{{field_name}}"] == {{new_value}}

def test_delete_{{resource_name}}():
    """Test deleting a {{resource_name}}"""
    # Create first
    create_response = client.post("/{{resource_plural}}/", json={...})
    created_id = create_response.json()["id"]

    # Delete
    response = client.delete(f"/{{resource_plural}}/{created_id}")
    assert response.status_code == 204

    # Verify deleted
    get_response = client.get(f"/{{resource_plural}}/{created_id}")
    assert get_response.status_code == 404

def test_get_nonexistent_{{resource_name}}():
    """Test getting a non-existent {{resource_name}}"""
    response = client.get("/{{resource_plural}}/99999")
    assert response.status_code == 404
```

### Step 3: Frontend Component Template (React/TypeScript)

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface {{ResourceName}} {
  id: number;
  {{#fields}}
  {{field_name}}: {{ts_type}};
  {{/fields}}
  created_at: string;
  updated_at?: string;
}

interface {{ResourceName}}FormData {
  {{#fields}}
  {{field_name}}: {{ts_type}};
  {{/fields}}
}

export const {{ResourceName}}List: React.FC = () => {
  const [items, setItems] = useState<{{ResourceName}}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/{{resource_plural}}');
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch {{resource_plural}}');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;

    try {
      await axios.delete(`/api/{{resource_plural}}/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete {{resource_name}}');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{{ResourceName}}s</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            {{#fields}}
            <th>{{field_label}}</th>
            {{/fields}}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              {{#fields}}
              <td>{item.{{field_name}}}</td>
              {{/fields}}
              <td>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Usage

### Generate Complete CRUD
```
generate_crud --resource "Task" --fields "title:string,description:text,completed:boolean" --framework fastapi
```

### Generate Specific Components
```
generate_crud --resource "Task" --component model
generate_crud --resource "Task" --component api
generate_crud --resource "Task" --component frontend
generate_crud --resource "Task" --component tests
```

### Generate with Relationships
```
generate_crud --resource "Comment" --fields "content:text,user_id:int" --foreign-keys "user_id:users.id"
```

## Configuration Options

- `--resource`: Resource name (singular, PascalCase)
- `--fields`: Comma-separated field definitions (name:type:constraints)
- `--framework`: Backend framework (fastapi, express, django, etc.)
- `--database`: Database type (postgresql, mysql, sqlite)
- `--auth`: Include authentication/authorization (yes/no)
- `--soft-delete`: Use soft deletes instead of hard deletes (yes/no)
- `--pagination`: Include pagination (yes/no)
- `--search`: Include search/filter capabilities (yes/no)

## Output Structure

```
src/
├── models/
│   └── {{resource_name}}.py
├── schemas/
│   └── {{resource_name}}.py
├── repositories/
│   └── {{resource_name}}.py
├── routers/
│   └── {{resource_name}}.py
└── tests/
    └── test_{{resource_name}}.py
```

## Best Practices

1. **Validation:** Always validate input data
2. **Error Handling:** Return appropriate HTTP status codes
3. **Pagination:** Implement pagination for list endpoints
4. **Soft Deletes:** Consider soft deletes for data retention
5. **Audit Fields:** Include created_at, updated_at timestamps
6. **Security:** Validate permissions on each endpoint
7. **Testing:** Generate comprehensive test coverage
8. **Documentation:** Include OpenAPI/Swagger docs

## Notes

- Generated code follows project constitution
- Review and customize generated code for specific requirements
- Add business logic and validations as needed
- Ensure proper error handling and edge cases
- Consider performance implications (indexes, caching)
- Follow naming conventions from constitution
