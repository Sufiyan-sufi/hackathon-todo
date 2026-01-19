'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TaskForm from '@/components/tasks/TaskForm';
import TaskList from '@/components/tasks/TaskList';
import { Task } from '@/types/task';
import useTaskOperations from '@/hooks/useTaskOperations';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

// Separate component for the actual dashboard content
const DashboardContent = () => {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize task operations with the current user's ID only when user is authenticated
  const {
    tasks,
    loading: taskLoading,
    error: taskError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } = useTaskOperations({ userId: (user && isAuthenticated && user.id) ? user.id : 0 });

  // Combine errors from both auth and task operations
  const combinedError = globalError || taskError;

  // Handle task form submission for both create and update
  const handleTaskSubmit = async (taskData: any) => {
    if (!user || !user.id) {
      setGlobalError('User not authenticated. Please log in again.');
      return;
    }

    try {
      if (editingTask) {
        // Update existing task
        await updateTask(editingTask.id, taskData);
        setEditingTask(null);
      } else {
        // Create new task
        await createTask(taskData);
        setShowCreateForm(false);
      }
    } catch (error) {
      // Errors are already handled by the hook
    }
  };

  // Handle task edit
  const handleTaskEdit = (task: Task) => {
    if (!user || !user.id) {
      setGlobalError('User not authenticated. Please log in again.');
      return;
    }

    setEditingTask(task);
    setShowCreateForm(false); // Hide create form when editing
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Handle starting a new task creation
  const handleStartCreate = () => {
    if (!user || !user.id) {
      setGlobalError('User not authenticated. Please log in again.');
      return;
    }

    setShowCreateForm(true);
    setEditingTask(null); // Clear any editing state
  };

  // Handle canceling create
  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
          <button
            onClick={handleStartCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Task
          </button>
        </div>

        {/* Task Creation Form - Only show when explicitly requested */}
        {showCreateForm && (
          <TaskForm
            onSubmit={handleTaskSubmit}
            onCancel={handleCancelCreate}
            isEditing={false}
            submitLabel="Create Task"
            cancelLabel="Cancel"
          />
        )}

        {/* Task Editing Form - Show when editing a task */}
        {editingTask && (
          <TaskForm
            onSubmit={handleTaskSubmit}
            onCancel={handleCancelEdit}
            task={{
              title: editingTask.title,
              description: editingTask.description,
              completed: editingTask.completed
            }}
            isEditing={true}
            submitLabel="Update Task"
            cancelLabel="Cancel"
          />
        )}

        {/* Task List */}
        <TaskList
          userId={(user && isAuthenticated && user.id) ? user.id : 0}
          tasks={tasks}
          loading={taskLoading.fetch}
          error={taskError}
          onTaskEdit={handleTaskEdit}
          onToggleComplete={toggleTaskCompletion}
          onDeleteTask={deleteTask}
          onTaskDeleted={() => {
            // Refresh tasks after deletion - this will be handled by the hook automatically now
          }}
        />

        {/* Loading indicator for operations */}
        {(taskLoading.create || taskLoading.update || taskLoading.delete || taskLoading.toggle) && (
          <div
            className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
            role="alert"
            aria-live="polite"
          >
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        )}

        {/* Error display */}
        {combinedError && (
          <div
            className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg"
            role="alert"
            aria-live="assertive"
          >
            Error: {combinedError}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;