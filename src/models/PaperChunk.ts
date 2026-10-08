import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperChunk extends Document {
  paperId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chunkText: string;
  embedding: number[]; // Gemini embedding vector array (e.g., 1536 dimensions)
  pageNumber: number;
}

const PaperChunkSchema = new Schema<IPaperChunk>(
  {
    paperId: {
      type: Schema.Types.ObjectId,
      ref: 'Paper',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // Vector array for MongoDB Atlas Vector Search
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Indexing for performance if needed
// Note: Atlas Vector Search index is configured directly on MongoDB Atlas dashboard.

export default mongoose.models.PaperChunk || mongoose.model<IPaperChunk>('PaperChunk', PaperChunkSchema);