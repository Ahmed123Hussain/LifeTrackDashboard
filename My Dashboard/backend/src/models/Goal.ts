import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  text: string;
  completed: boolean;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetDate: Date;
  milestones: IMilestone[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  text: {
    type: String,
    required: true,
    maxlength: 200,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const GoalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide goal title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide target date'],
    },
    milestones: [MilestoneSchema],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Calculate progress based on completed milestones
GoalSchema.pre('save', function (next) {
  if (this.milestones.length > 0) {
    const completed = this.milestones.filter((m) => m.completed).length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
  } else {
    this.progress = 0;
  }
  next();
});

export default mongoose.model<IGoal>('Goal', GoalSchema);
