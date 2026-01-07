# Skill: enforce_clean_code

## Description
Apply type hints and error handling.

## Instructions
This skill enforces clean code practices by systematically applying type hints, proper error handling, and other code quality improvements across the codebase.

## Core Principles

### 1. Type Hints (Python)
Apply comprehensive type hints for:
- Function parameters
- Return values
- Class attributes
- Variables (when type is not obvious)

### 2. Error Handling
Implement proper error handling:
- Specific exception types
- Meaningful error messages
- Appropriate error propagation
- Graceful degradation

### 3. Code Quality
Enforce additional clean code practices:
- Descriptive naming
- Single responsibility
- DRY (Don't Repeat Yourself)
- Clear comments for complex logic

## Type Hints Guidelines

### Function Type Hints

**Before:**
```python
def calculate_total(items, tax_rate):
    total = sum(item['price'] for item in items)
    return total * (1 + tax_rate)
```

**After:**
```python
from typing import List, Dict, Any

def calculate_total(items: List[Dict[str, Any]], tax_rate: float) -> float:
    """Calculate total price including tax.

    Args:
        items: List of item dictionaries with 'price' key
        tax_rate: Tax rate as decimal (e.g., 0.08 for 8%)

    Returns:
        Total price including tax
    """
    total: float = sum(item['price'] for item in items)
    return total * (1 + tax_rate)
```

### Class Type Hints

**Before:**
```python
class User:
    def __init__(self, name, email, age):
        self.name = name
        self.email = email
        self.age = age
```

**After:**
```python
from typing import Optional
from datetime import datetime

class User:
    """User model with type-safe attributes."""

    name: str
    email: str
    age: int
    created_at: datetime
    last_login: Optional[datetime]

    def __init__(self, name: str, email: str, age: int) -> None:
        self.name = name
        self.email = email
        self.age = age
        self.created_at = datetime.now()
        self.last_login = None
```

### Advanced Type Hints

**Generics:**
```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

class Repository(Generic[T]):
    """Generic repository pattern."""

    def __init__(self) -> None:
        self._items: List[T] = []

    def add(self, item: T) -> None:
        self._items.append(item)

    def get_all(self) -> List[T]:
        return self._items.copy()
```

**Union Types:**
```python
from typing import Union

def process_id(id_value: Union[int, str]) -> str:
    """Process ID that can be int or string."""
    return str(id_value)
```

**Optional and None:**
```python
from typing import Optional

def find_user(user_id: int) -> Optional[User]:
    """Find user by ID, returns None if not found."""
    # Implementation
    return user if found else None
```

**Callable:**
```python
from typing import Callable

def apply_operation(value: int, operation: Callable[[int], int]) -> int:
    """Apply a callable operation to a value."""
    return operation(value)
```

## Error Handling Guidelines

### Specific Exceptions

**Before:**
```python
def divide(a, b):
    return a / b
```

**After:**
```python
def divide(a: float, b: float) -> float:
    """Divide two numbers with proper error handling.

    Args:
        a: Numerator
        b: Denominator

    Returns:
        Result of division

    Raises:
        ValueError: If denominator is zero
        TypeError: If arguments are not numeric
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Arguments must be numeric")

    if b == 0:
        raise ValueError("Cannot divide by zero")

    return a / b
```

### Try-Except Patterns

**Basic Pattern:**
```python
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def fetch_user_data(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetch user data from external API.

    Args:
        user_id: User ID to fetch

    Returns:
        User data dictionary, or None if fetch fails
    """
    try:
        response = api_client.get(f"/users/{user_id}")
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as e:
        logger.error(f"HTTP error fetching user {user_id}: {e}")
        return None
    except requests.RequestException as e:
        logger.error(f"Request error fetching user {user_id}: {e}")
        return None
    except ValueError as e:
        logger.error(f"Invalid JSON for user {user_id}: {e}")
        return None
```

**Multiple Exception Handling:**
```python
def process_file(file_path: str) -> bool:
    """Process a file with comprehensive error handling.

    Args:
        file_path: Path to file to process

    Returns:
        True if successful, False otherwise

    Raises:
        FileNotFoundError: If file doesn't exist
        PermissionError: If file is not readable
    """
    try:
        with open(file_path, 'r') as f:
            data = f.read()
            # Process data
            return True
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        raise
    except PermissionError:
        logger.error(f"Permission denied: {file_path}")
        raise
    except IOError as e:
        logger.error(f"IO error processing {file_path}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error processing {file_path}: {e}")
        return False
```

**Context Managers:**
```python
from contextlib import contextmanager
from typing import Generator

@contextmanager
def database_transaction(db: Database) -> Generator[None, None, None]:
    """Context manager for database transactions.

    Args:
        db: Database connection

    Yields:
        None

    Raises:
        DatabaseError: If transaction fails
    """
    try:
        db.begin()
        yield
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction failed: {e}")
        raise DatabaseError(f"Transaction failed: {e}") from e
```

### Custom Exceptions

```python
class AppException(Exception):
    """Base exception for application."""
    pass

class ValidationError(AppException):
    """Raised when validation fails."""
    def __init__(self, field: str, message: str) -> None:
        self.field = field
        self.message = message
        super().__init__(f"Validation error on '{field}': {message}")

class ResourceNotFoundError(AppException):
    """Raised when resource is not found."""
    def __init__(self, resource_type: str, resource_id: Any) -> None:
        self.resource_type = resource_type
        self.resource_id = resource_id
        super().__init__(f"{resource_type} with id {resource_id} not found")

class AuthenticationError(AppException):
    """Raised when authentication fails."""
    pass
```

## Enforcement Checklist

### For Each Function
- [ ] Parameters have type hints
- [ ] Return type is specified
- [ ] Docstring with Args, Returns, Raises
- [ ] Error cases are handled
- [ ] Meaningful error messages
- [ ] Logging for errors (where appropriate)

### For Each Class
- [ ] Class attributes have type hints
- [ ] `__init__` has proper type hints
- [ ] Methods have type hints
- [ ] Class docstring present
- [ ] Error handling in methods

### For Each Module
- [ ] Imports are typed (from typing import ...)
- [ ] Module-level docstring present
- [ ] Type aliases defined (if needed)
- [ ] Custom exceptions defined (if needed)

## Automated Checks

### MyPy Configuration
```ini
# mypy.ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_any_unimported = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
check_untyped_defs = True
```

### Type Checking Commands
```bash
# Check entire project
mypy src/

# Check specific file
mypy src/module.py

# Check with strict mode
mypy --strict src/
```

### Linting Configuration
```ini
# .pylintrc
[TYPECHECK]
generated-members=responses.*

[DESIGN]
max-args=7
max-attributes=10
max-locals=15
```

## TypeScript Type Hints

### Function Types
```typescript
// Before
function processUser(user, options) {
    return user.name;
}

// After
interface User {
    id: number;
    name: string;
    email: string;
}

interface ProcessOptions {
    uppercase?: boolean;
    trim?: boolean;
}

function processUser(user: User, options: ProcessOptions): string {
    let result = user.name;
    if (options.trim) result = result.trim();
    if (options.uppercase) result = result.toUpperCase();
    return result;
}
```

### Error Handling (TypeScript)
```typescript
class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchData<T>(url: string): Promise<T> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new ApiError(
                response.status,
                `HTTP error: ${response.statusText}`
            );
        }

        return await response.json() as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, 'Network error', error);
    }
}
```

## Usage

### Scan and Report
```
enforce_clean_code scan --path src/ --report
```

### Auto-fix File
```
enforce_clean_code fix --file src/module.py
```

### Check Specific Issues
```
enforce_clean_code check --issues type-hints,error-handling --path src/
```

### Validate Module
```
enforce_clean_code validate --module src/services/user.py
```

## Output

The skill will:
1. Identify functions/classes missing type hints
2. Detect inadequate error handling
3. Suggest specific improvements
4. Apply fixes (when auto-fix mode enabled)
5. Generate a report with:
   - Coverage metrics (% typed)
   - Missing type hints locations
   - Inadequate error handling locations
   - Recommendations

## Integration with CI/CD

```yaml
# .github/workflows/type-check.yml
name: Type Check

on: [push, pull_request]

jobs:
  mypy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install mypy
          pip install -r requirements.txt
      - name: Run MyPy
        run: mypy src/ --strict
```

## Best Practices

1. **Start at boundaries:** Type APIs, interfaces, and public functions first
2. **Progressive typing:** Don't try to type everything at once
3. **Any as last resort:** Avoid `Any`, use specific types or `Union`
4. **Document exceptions:** Always document raised exceptions in docstrings
5. **Fail fast:** Validate inputs early, fail with clear messages
6. **Log before raising:** Log context before raising exceptions
7. **Custom exceptions:** Use custom exception hierarchies for clarity
8. **Type aliases:** Define type aliases for complex types
9. **Generic types:** Use generics for reusable components
10. **Consistent patterns:** Follow project conventions for error handling

## Notes

- Type hints are not enforced at runtime (use Pydantic for runtime validation)
- Focus on public APIs and complex functions first
- Balance between type safety and code readability
- Use `# type: ignore` sparingly with comments explaining why
- Consider using `typing_extensions` for newer features in older Python versions
