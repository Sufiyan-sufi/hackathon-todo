"""CLI main entry point for Todo application."""
import sys
import logging
import shlex
from typing import List

from src.models.task import Task
from src.services.todo_service import add_task, delete_task, update_task, view_tasks, mark_complete


# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def parse_command(command: str, tasks: List[Task]) -> bool:
    """Parse and execute CLI commands.

    Supports the following commands:
        - add "<title>" "<description>": Add a new task
        - delete <id>: Delete a task by ID
        - update <id> "<title>" "<description>": Update a task (title/description optional)
        - list or view: Show all tasks
        - complete <id> or mark <id>: Toggle task completion status
        - exit or quit: Exit the application

    Args:
        command: The raw command string to parse.
        tasks: The shared task list to operate on.

    Returns:
        True if the command was processed successfully, False if it was an exit command.

    Examples:
        >>> tasks = []
        >>> parse_command('add "Buy milk" "2% milk for coffee"', tasks)
        Task added: ID 1 - Buy milk
        >>> parse_command('list', tasks)
        [ ] 1 - Buy milk
              Description: 2% milk for coffee
    """
    logger.debug(f"Parsing command: {command}")

    if not command or not command.strip():
        print("Error: No command provided.")
        return True

    parts = command.strip().split(maxsplit=1)
    cmd = parts[0].lower()

    # Handle commands without arguments
    if cmd in ["list", "view"]:
        logger.info("Executing list/view command")
        view_tasks(tasks)
        return True
    elif cmd in ["exit", "quit"]:
        logger.info("Exit command received")
        return False  # Signal to exit the main loop

    # Handle commands that require arguments
    if len(parts) < 2:
        logger.warning(f"Invalid command format for '{cmd}': requires arguments")
        print(f"Error: Invalid command format. Command '{cmd}' requires arguments.")
        print("Usage examples:")
        print("  add \"<title>\" \"<description>\"")
        print("  delete <id>")
        print("  update <id> \"<title>\" \"<description>\"")
        print("  complete <id> or mark <id>")
        print("  list or view")
        print("  exit or quit")
        return True

    args_str = parts[1]

    try:
        if cmd == "add":
            # Parse title and description using shlex for quote-aware splitting
            logger.info("Executing add command")
            parts = shlex.split(args_str)
            if len(parts) == 0:
                print("Error: Add command requires a title.")
                return True
            # For add: join all but last as title, last as description if present
            # e.g., 'add Meeting today' -> title="Meeting", desc="today"
            # e.g., 'add "Meeting today"' -> title="Meeting today", desc=""
            # e.g., 'add "Meeting today" "with team"' -> title="Meeting today", desc="with team"
            if len(parts) > 1:
                title = ' '.join(parts[:-1])
                description = parts[-1]
            else:
                title = parts[0]
                description = ""
            add_task(tasks, title, description)
        elif cmd == "delete":
            logger.info(f"Executing delete command for task ID: {args_str.strip()}")
            task_id = int(args_str.strip())
            delete_task(tasks, task_id)
        elif cmd in ["complete", "mark"]:
            logger.info(f"Executing {cmd} command for task ID: {args_str.strip()}")
            task_id = int(args_str.strip())
            mark_complete(tasks, task_id)
        elif cmd == "update":
            # Parse task_id, title, and description using shlex
            logger.info(f"Executing update command")
            parts = shlex.split(args_str)
            if len(parts) < 1:
                print("Error: Update command requires at least a task ID.")
                return True
            task_id = int(parts[0])
            title = ' '.join(parts[1:-1]) if len(parts) > 2 else (parts[1] if len(parts) > 1 else None)
            description = parts[-1] if len(parts) > 2 else None
            update_task(tasks, task_id, title, description)
        else:
            logger.warning(f"Unknown command received: {cmd}")
            print(f"Error: Unknown command '{cmd}'. Available commands: add, delete, update, list, view, complete, mark, exit, quit")
    except ValueError as e:
        logger.error(f"ValueError in command processing: {e}")
        print(f"Error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in command processing: {e}")
        print(f"Unexpected error: {e}")

    return True






def main():
    """Main entry point for CLI application."""
    logger.info("Starting Todo Application CLI")
    print("Todo Application - Interactive CLI")
    print("Commands: add, delete, update, list, view, complete, mark, exit, quit")
    print("Type 'exit' or 'quit' to quit")

    # Initialize shared task list
    tasks: List[Task] = []
    logger.debug("Initialized empty task list")

    while True:
        try:
            user_input = input("\n> ").strip()
            logger.debug(f"Received user input: {user_input}")

            # Process the command and check if we should continue
            should_continue = parse_command(user_input, tasks)
            if not should_continue:
                logger.info("Exiting application")
                print("Goodbye!")
                break

        except KeyboardInterrupt:
            logger.info("KeyboardInterrupt received, exiting")
            print("\nGoodbye!")
            break
        except EOFError:
            logger.info("EOF received, exiting")
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()
