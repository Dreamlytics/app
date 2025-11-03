import mongoose, { Schema, Document } from 'mongoose';

export interface IAILog extends Document {
  userId: mongoose.Types.ObjectId;
  dreamId?: mongoose.Types.ObjectId;
  operation: 'analyze' | 'extract' | 'refresh';
  aiModel: string;
  requestData: {
    dreamTitle?: string;
    dreamContent: string;
    tags?: string[];
  };
  responseData: {
    analysis?: string;
    motifs?: string[];
    emotions?: string[];
    emotionalIntensity?: number;
    primaryTheme?: string;
    symbolism?: Array<{ symbol: string; meaning: string }>;
    archetypes?: string[];
    lucidityLevel?: number;
  };
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  success: boolean;
  errorMessage?: string;
  processingTime: number; // milliseconds
  createdAt: Date;
}

const aiLogSchema = new Schema<IAILog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dreamId: {
    type: Schema.Types.ObjectId,
    ref: 'Dream',
    index: true
  },
  operation: {
    type: String,
    enum: ['analyze', 'extract', 'refresh'],
    required: true
  },
  aiModel: {
    type: String,
    required: true
  },
  requestData: {
    dreamTitle: String,
    dreamContent: {
      type: String,
      required: true
    },
    tags: [String]
  },
  responseData: {
    analysis: String,
    motifs: [String],
    emotions: [String],
    emotionalIntensity: Number,
    primaryTheme: String,
    symbolism: [{
      symbol: String,
      meaning: String
    }],
    archetypes: [String],
    lucidityLevel: Number
  },
  usage: {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: String,
  processingTime: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for querying logs by user and date
aiLogSchema.index({ userId: 1, createdAt: -1 });
aiLogSchema.index({ dreamId: 1, createdAt: -1 });

export const AILog = mongoose.models.AILog || mongoose.model<IAILog>('AILog', aiLogSchema);
