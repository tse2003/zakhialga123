import mongoose, { Schema } from 'mongoose';

const replacedFilterSchema = new Schema(
  {
    filterNumber: { type: Number, required: true },
    name: { type: String, required: true },
    previousChangedAt: { type: Date, required: true },
    previousDueAt: { type: Date, required: true },
    nextChangeAt: { type: Date, required: true },
  },
  { _id: false }
);

const serviceHistorySchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    customerCode: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    replacedAt: { type: Date, required: true, index: true },
    filters: { type: [replacedFilterSchema], required: true },
    workerName: { type: String, default: '', trim: true },
    price: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'paid',
    },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.ServiceHistory ||
  mongoose.model('ServiceHistory', serviceHistorySchema);

