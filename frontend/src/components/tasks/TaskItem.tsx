'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { useAuth } from '@/lib/auth/auth-context';
import DeleteConfirmation from './DeleteConfirmation';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isLoading?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className={`p-4 mb-3 rounded-lg border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} shadow-sm transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          disabled={isLoading}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        />

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
              {task.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>ID: {task.id}</span>
            <span>•</span>
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.updated_at !== task.created_at && (
              <>
                <span>•</span>
                <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            aria-label="Edit task"
            tabIndex={0}
          >
            Edit
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            aria-label="Delete task"
            tabIndex={0}
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        taskTitle={task.title}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TaskItem;