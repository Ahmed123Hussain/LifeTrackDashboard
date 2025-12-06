import { Response } from 'express';
import Goal from '../models/Goal.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

export const getGoals = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const goals = await Goal.find({ userId: req.user?.userId }).sort({
      createdAt: -1,
    });
    res.json(successResponse(goals));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch goals', error.message));
  }
};

export const getGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });
    if (!goal) {
      res.status(404).json(errorResponse('Goal not found'));
      return;
    }
    res.json(successResponse(goal));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch goal', error.message));
  }
};

export const createGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, targetDate, milestones } = req.body;

    if (!title || !targetDate) {
      res.status(400).json(errorResponse('Title and target date are required'));
      return;
    }

    const goal = new Goal({
      userId: req.user?.userId,
      title,
      description,
      targetDate,
      milestones: milestones || [],
    });

    await goal.save();
    res.status(201).json(successResponse(goal, 'Goal created successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to create goal', error.message));
  }
};

export const updateGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, targetDate, milestones } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(targetDate && { targetDate }),
        ...(milestones && { milestones }),
      },
      { new: true }
    );

    if (!goal) {
      res.status(404).json(errorResponse('Goal not found'));
      return;
    }

    res.json(successResponse(goal, 'Goal updated successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to update goal', error.message));
  }
};

export const deleteGoal = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!goal) {
      res.status(404).json(errorResponse('Goal not found'));
      return;
    }

    res.json(successResponse(null, 'Goal deleted successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to delete goal', error.message));
  }
};

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // Dynamic import to avoid circular dependencies
    const Certification = (await import('../models/Certification.js')).default;
    const Degree = (await import('../models/Degree.js')).default;
    const Todo = (await import('../models/Todo.js')).default;

    const [certCount, degreeCount, completedTodos, totalTodos, upcomingGoals] =
      await Promise.all([
        Certification.countDocuments({ userId }),
        Degree.countDocuments({ userId }),
        Todo.countDocuments({ userId, status: 'done' }),
        Todo.countDocuments({ userId }),
        Goal.countDocuments({ userId, targetDate: { $gte: new Date() } }),
      ]);

    const todaysTodos = await Todo.find({
      userId,
      deadline: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    res.json(
      successResponse({
        certCount,
        degreeCount,
        completedTodos,
        totalTodos,
        upcomingGoals,
        todaysTodos,
      })
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to fetch dashboard stats', error.message));
  }
};
