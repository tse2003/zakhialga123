import mongoose, { Schema } from 'mongoose';

const priceOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    shortName: { type: String, default: '' },
    oldPrice: { type: String, default: '' },
    price: { type: String, required: true },
    image: { type: String, default: '' },
    badge: { type: String, default: '' },
    description: { type: String, default: '' },
    recommended: { type: Boolean, default: false },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: '' },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    badge: { type: String, default: '' },
    category: { type: String, enum: ['winix', 'faucet', 'other'], default: 'other' },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    options: { type: [priceOptionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);
