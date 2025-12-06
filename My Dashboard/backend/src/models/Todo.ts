import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;
  task: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: String,
      required: [true, 'Please provide a task'],
      trim: true,
      maxlength: 200,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'done'],
      default: 'pending',
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITodo>('Todo', TodoSchema);
