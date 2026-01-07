# Skill: auto_reschedule

## Description
Automatically reschedule recurring tasks based on completion status and frequency rules.

## Instructions
This skill provides the logic to calculate the next due date for tasks with recurrence patterns (daily, weekly, monthly, etc.) and automate the creation or update of subsequent task occurrences.

## Recurrence Logic

**Core Concept:** When a recurring task is marked as "completed", calculate the next due date and either create a new task or update the existing one's due date and reset its status.

### 1. Recurrence Calculator

```python
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from enum import Enum
from typing import Optional

class Frequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class RecurrenceManager:
    @staticmethod
    def calculate_next_due_date(current_due_date: datetime, frequency: Frequency, interval: int = 1) -> datetime:
        """
        Calculates the next due date based on frequency and interval.
        """
        if frequency == Frequency.DAILY:
            return current_due_date + timedelta(days=interval)
        elif frequency == Frequency.WEEKLY:
            return current_due_date + timedelta(weeks=interval)
        elif frequency == Frequency.MONTHLY:
            return current_due_date + relativedelta(months=interval)
        elif frequency == Frequency.YEARLY:
            return current_due_date + relativedelta(years=interval)
        else:
            raise ValueError(f"Unsupported frequency: {frequency}")

    @staticmethod
    def should_reschedule(status: str, recurrence_rule: Optional[str]) -> bool:
        """Determines if a task needs rescheduling."""
        return status.lower() == "completed" and recurrence_rule is not None
```

## Rescheduling Workflow

### 1. Integration with Task Repository

```python
async def complete_and_reschedule_task(task_id: int, db_session):
    # 1. Fetch current task
    task = await db_session.get_task(task_id)

    if not task.recurrence_rule:
        return await db_session.mark_complete(task_id)

    # 2. Calculate next date
    # Example rule format: "daily:1" (frequency:interval)
    freq_str, interval_str = task.recurrence_rule.split(':')
    next_date = RecurrenceManager.calculate_next_due_date(
        current_due_date=task.due_date or datetime.now(),
        frequency=Frequency(freq_str),
        interval=int(interval_str)
    )

    # 3. Create next occurrence (Option A: Clone)
    new_task = task.clone(
        due_date=next_date,
        status="pending",
        parent_task_id=task.id
    )
    await db_session.add(new_task)

    # 4. Mark current task as completed
    await db_session.mark_complete(task_id)

    return next_date
```

## Handling Edge Cases

1. **Overdue Recurring Tasks:**
   - **Fixed Schedule:** Next occurrence is calculated from the *original* due date (keeps the rhythm).
   - **Relative Schedule:** Next occurrence is calculated from the *completion* date (e.g., "1 week after I actually finish it").

2. **Weekend Skipping:**
   ```python
   def skip_weekends(date: datetime) -> datetime:
       if date.weekday() == 5: # Saturday
           return date + timedelta(days=2)
       if date.weekday() == 6: # Sunday
           return date + timedelta(days=1)
       return date
   ```

3. **End Dates/Count:**
   - Stop rescheduling if `current_date > end_date` or `occurrence_count >= max_occurrences`.

## Best Practices

1. **Audit Trail:** Maintain a link between occurrences (e.g., `parent_task_id`) to track the history of a recurring task.
2. **Bulk Processing:** For system-wide rescheduling, use a background worker (Celery, Cron, or Dapr Workflow).
3. **Timezones:** Store all due dates in UTC and convert to the user's local timezone only for display.
4. **Validation:** Validate recurrence strings (like CRON expressions) before saving them to the database.

## Usage in System

- **Trigger:** Rescheduling should be triggered immediately upon successful status update in the API.
- **Feedback:** Inform the user through the UI that "The next occurrence has been scheduled for [Date]".
