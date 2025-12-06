import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  organization: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide certification title'],
      trim: true,
      maxlength: 100,
    },
    organization: {
      type: String,
      required: [true, 'Please provide organization'],
      trim: true,
      maxlength: 100,
    },
    issueDate: {
      type: Date,
      required: [true, 'Please provide issue date'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICertification>('Certification', CertificationSchema);
