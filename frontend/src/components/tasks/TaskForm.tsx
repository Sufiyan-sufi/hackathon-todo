'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTaskFormData, UpdateTaskFormData } from '@/lib/validation/schemas';
import { createTaskSchema, updateTaskSchema } from '@/lib/validation/schemas';

interface TaskFormProps {
  onSubmit: (data: CreateTaskFormData | UpdateTaskFormData) => void;
  onCancel?: () => void;
  task?: CreateTaskFormData | UpdateTaskFormData;
  isEditing?: boolean;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  task,
  isEditing = false,
  isLoading = false,
  submitLabel = 'Save Task',
  cancelLabel = 'Cancel'
}) => {
  const schema = isEditing ? updateTaskSchema : createTaskSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: task || {
      title: '',
      description: '',
      completed: false
    }
  });

  const onSubmitHandler = async (data: CreateTaskFormData | UpdateTaskFormData) => {
    await onSubmit(data);
    if (!isEditing) {
      reset(); // Reset form after successful creation
    }
  };

  return (
    <div className="mb-6 p-6 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h2>

      <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            {...register('title')}
            type="text"
            disabled={isLoading || isSubmitting}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            disabled={isLoading || isSubmitting}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Task description (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center">
            <input
              id="completed"
              {...register('completed')}
              type="checkbox"
              disabled={isLoading || isSubmitting}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
              Mark as completed
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            tabIndex={0}
          >
            {isLoading || isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isSubmitting ? 'Saving...' : 'Submitting...'}
              </>
            ) : (
              submitLabel
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              tabIndex={0}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;