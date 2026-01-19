import { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';
import {
  getTasks as getTasksAPI,
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  toggleTaskCompletion as toggleTaskCompletionAPI
} from '@/lib/api/task-service';

interface UseTaskOperationsProps {
  userId: number;
}

interface TaskOperationsReturn {
  tasks: Task[];
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    toggle: boolean;
  };
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<void>;
  updateTask: (taskId: number, taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  toggleTaskCompletion: (taskId: number) => Promise<void>;
}

const useTaskOperations = ({ userId }: UseTaskOperationsProps): TaskOperationsReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
    toggle: false
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    // Only fetch if userId is valid
    if (!userId || userId <= 0) {
      setError('Invalid user ID provided');
      setLoading(prev => ({ ...prev, fetch: false }));
      return;
    }

    setLoading(prev => ({ ...prev, fetch: true }));
    setError(null);

    try {
      const taskData = await getTasksAPI(userId);
      setTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const createTask = async (taskData: CreateTaskData) => {
    // Check if userId is valid before creating task
    if (!userId || userId <= 0) {
      const errorMsg = 'Cannot create task: Invalid user ID';
      setError(errorMsg);
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(prev => ({ ...prev, create: true }));
    setError(null);

    try {
      const newTask = await createTaskAPI(userId, taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const updateTask = async (taskId: number, taskData: UpdateTaskData) => {
    // Check if userId is valid before updating task
    if (!userId || userId <= 0) {
      const errorMsg = 'Cannot update task: Invalid user ID';
      setError(errorMsg);
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(prev => ({ ...prev, update: true }));
    setError(null);

    try {
      const updatedTask = await updateTaskAPI(userId, taskId, taskData);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const deleteTask = async (taskId: number) => {
    // Check if userId is valid before deleting task
    if (!userId || userId <= 0) {
      const errorMsg = 'Cannot delete task: Invalid user ID';
      setError(errorMsg);
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);

    try {
      await deleteTaskAPI(userId, taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    // Check if userId is valid before toggling task completion
    if (!userId || userId <= 0) {
      const errorMsg = 'Cannot toggle task completion: Invalid user ID';
      setError(errorMsg);
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    setLoading(prev => ({ ...prev, toggle: true }));
    setError(null);

    try {
      const updatedTask = await toggleTaskCompletionAPI(userId, taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task completion');
      console.error('Error toggling task completion:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, toggle: false }));
    }
  };

  // Re-fetch tasks when userId changes
  useEffect(() => {
    if (userId && userId > 0) {
      fetchTasks();
    } else {
      // Reset tasks if user is not authenticated
      setTasks([]);
      setError(null);
    }
  }, [userId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  };
};

export default useTaskOperations;