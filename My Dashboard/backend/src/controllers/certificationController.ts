import { Response } from 'express';
import Certification from '../models/Certification.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCertifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const certs = await Certification.find({ userId: req.user?.userId }).sort(
      { createdAt: -1 }
    );
    res.json(successResponse(certs));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to fetch certifications', error.message));
  }
};

export const getCertification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cert = await Certification.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });
    if (!cert) {
      res.status(404).json(errorResponse('Certification not found'));
      return;
    }
    res.json(successResponse(cert));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to fetch certification', error.message));
  }
};

export const createCertification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, organization, issueDate, expiryDate } = req.body;

    if (!title || !organization || !issueDate) {
      res.status(400).json(errorResponse('Title, organization, and issue date are required'));
      return;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const cert = new Certification({
      userId: req.user?.userId,
      title,
      organization,
      issueDate,
      expiryDate,
      fileUrl,
    });

    await cert.save();
    res
      .status(201)
      .json(successResponse(cert, 'Certification created successfully'));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to create certification', error.message));
  }
};

export const updateCertification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, organization, issueDate, expiryDate } = req.body;

    const cert = await Certification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      {
        ...(title && { title }),
        ...(organization && { organization }),
        ...(issueDate && { issueDate }),
        ...(expiryDate && { expiryDate }),
      },
      { new: true }
    );

    if (!cert) {
      res.status(404).json(errorResponse('Certification not found'));
      return;
    }

    res.json(successResponse(cert, 'Certification updated successfully'));
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to update certification', error.message));
  }
};

export const deleteCertification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cert = await Certification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!cert) {
      res.status(404).json(errorResponse('Certification not found'));
      return;
    }

    res.json(
      successResponse(null, 'Certification deleted successfully')
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to delete certification', error.message));
  }
};
