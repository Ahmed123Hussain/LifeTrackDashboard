import { Response } from 'express';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json(errorResponse('Name, email, and password are required'));
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json(errorResponse('Email already in use'));
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json(
      successResponse(
        { user: { id: user._id, name: user.name, email: user.email }, token },
        'User registered successfully'
      )
    );
  } catch (error: any) {
    res.status(500).json(errorResponse('Registration failed', error.message));
  }
};

export const login = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json(errorResponse('Email and password are required'));
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const token = generateToken(user._id.toString());
    res.json(
      successResponse(
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            theme: user.theme,
          },
          token,
        },
        'Login successful'
      )
    );
  } catch (error: any) {
    res.status(500).json(errorResponse('Login failed', error.message));
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    res.json(
      successResponse({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
      })
    );
  } catch (error: any) {
    res.status(500).json(errorResponse('Failed to get user', error.message));
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, theme, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { ...(name && { name }), ...(theme && { theme }), ...(avatar && { avatar }) },
      { new: true }
    );

    if (!user) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    res.json(
      successResponse(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          theme: user.theme,
        },
        'Profile updated successfully'
      )
    );
  } catch (error: any) {
    res
      .status(500)
      .json(errorResponse('Failed to update profile', error.message));
  }
};
