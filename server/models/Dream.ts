import mongoose, { Schema, Document } from 'mongoose';

export interface IDream extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dreamSchema = new Schema<IDream>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
dreamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster queries
dreamSchema.index({ userId: 1, createdAt: -1 });
dreamSchema.index({ tags: 1 });
dreamSchema.index({ isPublic: 1 });

export const Dream = mongoose.models.Dream || mongoose.model<IDream>('Dream', dreamSchema);
