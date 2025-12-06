import { Response } from 'express';
import Todo from '../models/Todo.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTodos = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const filter: any = { userId: req.user?.userId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json(successResponse(todos));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch todos', error.message));
  }
};

export const getTodo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });
    if (!todo) {
      res.status(404).json(errorResponse('Todo not found'));
      return;
    }
    res.json(successResponse(todo));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch todo', error.message));
  }
};

export const createTodo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { task, priority, status, deadline } = req.body;

    if (!task) {
      res.status(400).json(errorResponse('Task is required'));
      return;
    }

    const todo = new Todo({
      userId: req.user?.userId,
      task,
      priority,
      status,
      deadline,
    });

    await todo.save();
    res.status(201).json(successResponse(todo, 'Todo created successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to create todo', error.message));
  }
};

export const updateTodo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { task, priority, status, deadline } = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      {
        ...(task && { task }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(deadline && { deadline }),
      },
      { new: true }
    );

    if (!todo) {
      res.status(404).json(errorResponse('Todo not found'));
      return;
    }

    res.json(successResponse(todo, 'Todo updated successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to update todo', error.message));
  }
};

export const deleteTodo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!todo) {
      res.status(404).json(errorResponse('Todo not found'));
      return;
    }

    res.json(successResponse(null, 'Todo deleted successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to delete todo', error.message));
  }
};
