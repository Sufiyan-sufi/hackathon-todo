"""Unit tests for the CLI Todo application."""
from src.cli.main import parse_quoted_args


def test_parse_quoted_args():
    """Test the quoted arguments parser."""
    # Test simple arguments
    result = parse_quoted_args("arg1 arg2")
    assert result == ["arg1", "arg2"]

    # Test quoted arguments with spaces
    result = parse_quoted_args('"arg with spaces" arg2')
    assert result == ["arg with spaces", "arg2"]

    # Test multiple quoted arguments
    result = parse_quoted_args('"arg1" "arg with spaces" arg3')
    assert result == ["arg1", "arg with spaces", "arg3"]

    # Test mixed quoted and unquoted
    result = parse_quoted_args('arg1 "quoted arg" arg3')
    assert result == ["arg1", "quoted arg", "arg3"]

    # Test single argument
    result = parse_quoted_args('single_arg')
    assert result == ["single_arg"]

    # Test single quoted argument
    result = parse_quoted_args('"single quoted arg"')
    assert result == ["single quoted arg"]

    print("✓ All parse_quoted_args tests passed")


if __name__ == "__main__":
    test_parse_quoted_args()
    print("All unit tests passed! ✓")