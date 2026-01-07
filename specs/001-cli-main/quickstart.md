# Quickstart Guide: CLI Main Integration

## Running the CLI

To start the CLI application:

```bash
python -m src.cli.main
```

## Available Commands

### Add Task
```bash
add "Task Title" "Optional Description"
```
Examples:
- `add "Buy groceries"`
- `add "Meeting with team" "Discuss project timeline"`

### View Tasks
```bash
list
# or
view
```

### Update Task
```bash
update <task_id> "New Title" "Optional New Description"
```
Examples:
- `update 1 "Updated task title"`
- `update 1 "Updated title" "Updated description"`

### Delete Task
```bash
delete <task_id>
```
Example: `delete 1`

### Mark Complete/Incomplete
```bash
complete <task_id>
# or
mark <task_id>
```
Examples:
- `complete 1`
- `mark 1`

### Exit CLI
```bash
exit
# or
quit
```

## Command Parsing

The CLI uses `shlex` for quote-aware parsing, allowing multi-word titles and descriptions:
- Unquoted words: `add Meeting today` → title="Meeting", description="today"
- Quoted strings: `add "Meeting today" "With the team"` → title="Meeting today", description="With the team"

## Example Session

```
> add "Buy milk" "2% for coffee"
Task added: ID 1 - Buy milk
> list
[ ] 1 - Buy milk
      Description: 2% for coffee
> complete 1
Task marked as complete: ID 1 - Buy milk
> list
[X] 1 - Buy milk
      Description: 2% for coffee
> exit
Goodbye!
```