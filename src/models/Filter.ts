import mongoose, { Schema } from 'mongoose';

const filterSchema = new Schema(
  {
    stage: { type: String, required: true },
    name: { type: String, required: true },
    englishName: { type: String, default: '' },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '' },
    price: { type: String, required: true },
    accent: { type: String, enum: ['rose', 'green', 'blue', 'orange'], default: 'blue' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Filter || mongoose.model('Filter', filterSchema);
