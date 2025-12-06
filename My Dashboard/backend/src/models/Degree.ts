import mongoose, { Schema, Document } from 'mongoose';

export interface IDegree extends Document {
  userId: mongoose.Types.ObjectId;
  degreeName: string;
  university: string;
  startDate: Date;
  endDate: Date;
  gpa?: number;
  notes?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const DegreeSchema = new Schema<IDegree>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    degreeName: {
      type: String,
      required: [true, 'Please provide degree name'],
      trim: true,
      maxlength: 100,
    },
    university: {
      type: String,
      required: [true, 'Please provide university'],
      trim: true,
      maxlength: 100,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      maxlength: 500,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDegree>('Degree', DegreeSchema);
