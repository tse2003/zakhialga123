import mongoose, { Schema } from 'mongoose';

const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.models.Counter ||
  mongoose.model('Counter', counterSchema);

