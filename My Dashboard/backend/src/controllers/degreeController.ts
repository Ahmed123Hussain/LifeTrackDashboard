import { Response } from 'express';
import Degree from '../models/Degree.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDegrees = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const degrees = await Degree.find({ userId: req.user?.userId }).sort({
      createdAt: -1,
    });
    res.json(successResponse(degrees));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch degrees', error.message));
  }
};

export const getDegree = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const degree = await Degree.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });
    if (!degree) {
      res.status(404).json(errorResponse('Degree not found'));
      return;
    }
    res.json(successResponse(degree));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to fetch degree', error.message));
  }
};

export const createDegree = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { degreeName, university, startDate, endDate, gpa, notes } = req.body;

    if (!degreeName || !university || !startDate || !endDate) {
      res
        .status(400)
        .json(
          errorResponse('Degree name, university, start date, and end date are required')
        );
      return;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileName = req.file ? req.file.originalname : null;
    const fileType = req.file ? req.file.mimetype : null;

    const degree = new Degree({
      userId: req.user?.userId,
      degreeName,
      university,
      startDate,
      endDate,
      gpa,
      notes,
      fileUrl,
      fileName,
      fileType,
    });

    await degree.save();
    res.status(201).json(successResponse(degree, 'Degree created successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to create degree', error.message));
  }
};

export const updateDegree = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { degreeName, university, startDate, endDate, gpa, notes } = req.body;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const fileName = req.file ? req.file.originalname : undefined;
    const fileType = req.file ? req.file.mimetype : undefined;

    const updateFields: any = {
      ...(degreeName && { degreeName }),
      ...(university && { university }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(gpa && { gpa }),
      ...(notes && { notes }),
    };
    if (fileUrl !== undefined) {
      updateFields.fileUrl = fileUrl;
      updateFields.fileName = fileName;
      updateFields.fileType = fileType;
    }

    const degree = await Degree.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      updateFields,
      { new: true }
    );

    if (!degree) {
      res.status(404).json(errorResponse('Degree not found'));
      return;
    }

    res.json(successResponse(degree, 'Degree updated successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to update degree', error.message));
  }
};

export const deleteDegree = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const degree = await Degree.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!degree) {
      res.status(404).json(errorResponse('Degree not found'));
      return;
    }

    res.json(successResponse(null, 'Degree deleted successfully'));
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to delete degree', error.message));
  }
};
