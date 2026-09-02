import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema(
  {
    productName: { type: String, required: true },
    optionName: { type: String, default: '' },
    price: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    source: { type: String, default: 'website' },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
