"""Integration tests for the CLI Todo application."""
from src.cli.main import parse_command
from src.models.task import Task


class TestCLIIntegration:
    """Integration tests covering all command flows in the CLI application."""

    def test_add_list_view_flow(self):
        """Test the basic add/list/view flow."""
        tasks = []

        # Add a task
        result = parse_command('add "Test Task" "Test Description"', tasks)
        assert result is True  # Should continue
        assert len(tasks) == 1
        assert tasks[0].title == "Test Task"
        assert tasks[0].description == "Test Description"

        # List tasks
        result = parse_command('list', tasks)
        assert result is True  # Should continue

        # View tasks (alias for list)
        result = parse_command('view', tasks)
        assert result is True  # Should continue
        print("✓ Add/list/view flow test passed")

    def test_add_update_delete_flow(self):
        """Test the modify flow: add, update, delete."""
        tasks = []

        # Add a task
        result = parse_command('add "Original Task" "Original Description"', tasks)
        assert result is True
        assert len(tasks) == 1
        assert tasks[0].title == "Original Task"

        # Update the task
        result = parse_command('update 1 "Updated Task" "Updated Description"', tasks)
        assert result is True
        assert tasks[0].title == "Updated Task"
        assert tasks[0].description == "Updated Description"

        # Delete the task
        result = parse_command('delete 1', tasks)
        assert result is True
        assert len(tasks) == 0
        print("✓ Add/update/delete flow test passed")

    def test_completion_status_flow(self):
        """Test the completion status flow."""
        tasks = []

        # Add a task
        result = parse_command('add "Completion Test" "Test completion flow"', tasks)
        assert result is True
        assert len(tasks) == 1
        assert tasks[0].completed is False  # Should start as incomplete

        # Mark as complete
        result = parse_command('complete 1', tasks)
        assert result is True
        assert tasks[0].completed is True  # Should be complete

        # Mark as incomplete using 'mark' alias
        result = parse_command('mark 1', tasks)
        assert result is True
        assert tasks[0].completed is False  # Should be incomplete
        print("✓ Completion status flow test passed")

    def test_command_validation(self):
        """Test command validation and error handling."""
        tasks = []

        # Test unknown command
        result = parse_command('unknowncommand', tasks)
        assert result is True  # Should continue despite error

        # Test malformed command
        result = parse_command('add', tasks)
        assert result is True  # Should continue despite error

        # Test invalid task ID
        result = parse_command('delete abc', tasks)
        assert result is True  # Should continue despite error

        # Test non-existent task ID
        result = parse_command('delete 999', tasks)
        assert result is True  # Should continue despite error
        print("✓ Command validation test passed")

    def test_exit_flow(self):
        """Test exit/quit command flow."""
        tasks = []

        # Add a task first
        result = parse_command('add "Exit Test" "Test exit command"', tasks)
        assert result is True
        assert len(tasks) == 1

        # Test exit command
        result = parse_command('exit', tasks)
        assert result is False  # Should signal to exit

        # Test quit command
        result = parse_command('quit', tasks)
        assert result is False  # Should signal to exit
        print("✓ Exit flow test passed")

    def test_quoted_strings_handling(self):
        """Test handling of quoted strings with spaces."""
        tasks = []

        # Add a task with spaces in title and description
        result = parse_command('add "Test Task With Spaces" "Test Description With Multiple Words"', tasks)
        assert result is True
        assert len(tasks) == 1
        assert tasks[0].title == "Test Task With Spaces"
        assert tasks[0].description == "Test Description With Multiple Words"

        # Update with spaces
        result = parse_command('update 1 "Updated Task With Spaces" "Updated Description With Multiple Words"', tasks)
        assert result is True
        assert tasks[0].title == "Updated Task With Spaces"
        assert tasks[0].description == "Updated Description With Multiple Words"
        print("✓ Quoted strings handling test passed")


def run_tests():
    """Run all integration tests."""
    test_instance = TestCLIIntegration()

    print("Running CLI Integration Tests...")
    print("-" * 40)

    test_instance.test_add_list_view_flow()
    test_instance.test_add_update_delete_flow()
    test_instance.test_completion_status_flow()
    test_instance.test_command_validation()
    test_instance.test_exit_flow()
    test_instance.test_quoted_strings_handling()

    print("-" * 40)
    print("All integration tests passed! ✓")


if __name__ == "__main__":
    run_tests()