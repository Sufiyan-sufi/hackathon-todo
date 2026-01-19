"""
Basic tests for the Todo API
"""
import pytest
from fastapi.testclient import TestClient
from app import app, create_db_and_tables, Task
from sqlmodel import create_engine, Session, SQLModel
from unittest.mock import patch

client = TestClient(app)

def test_create_task():
    """Test creating a task with mock JWT token"""
    with patch('app.verify_jwt_token') as mock_verify:
        mock_verify.return_value = {"user_id": 1}

        response = client.post(
            "/api/1/tasks",
            json={"title": "Test Task", "description": "A test task"},
            headers={"Authorization": "Bearer fake-token"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["user_id"] == 1

def test_get_tasks():
    """Test getting tasks for a user with mock JWT token"""
    with patch('app.verify_jwt_token') as mock_verify:
        mock_verify.return_value = {"user_id": 1}

        response = client.get("/api/1/tasks", headers={"Authorization": "Bearer fake-token"})
        assert response.status_code == 200

def test_get_single_task():
    """Test getting a single task with mock JWT token"""
    with patch('app.verify_jwt_token') as mock_verify:
        mock_verify.return_value = {"user_id": 1}

        # First create a task
        create_response = client.post(
            "/api/1/tasks",
            json={"title": "Test Task"},
            headers={"Authorization": "Bearer fake-token"}
        )
        task_id = create_response.json()["id"]

        # Then get the task
        response = client.get(f"/api/1/tasks/{task_id}", headers={"Authorization": "Bearer fake-token"})
        assert response.status_code == 200

def test_unauthorized_access():
    """Test unauthorized access to tasks"""
    with patch('app.verify_jwt_token') as mock_verify:
        mock_verify.return_value = {"user_id": 2}  # Different user

        response = client.get("/api/1/tasks", headers={"Authorization": "Bearer fake-token"})
        assert response.status_code == 401