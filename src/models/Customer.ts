import mongoose, { Schema } from 'mongoose';

const filterScheduleSchema = new Schema(
  {
    filterNumber: { type: Number, required: true, min: 1, max: 4 },
    name: { type: String, required: true },
    intervalMonths: { type: Number, required: true },
    lastChangedAt: { type: Date, required: true },
    nextChangeAt: { type: Date, required: true },
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    customerCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: { type: String, default: '', trim: true },
    district: { type: String, default: '', trim: true },
    khoroo: { type: String, default: '', trim: true },
    address: { type: String, required: true, trim: true },
    purifierModel: {
      type: String,
      default: 'AQUABLUE 4 шатлалт цорготой ус цэвэршүүлэгч',
      trim: true,
    },
    installedAt: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
    notes: { type: String, default: '', trim: true },
    filterSchedules: {
      type: [filterScheduleSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => value.length === 4,
        message: 'Дөрвөн фильтерийн хуваарь шаардлагатай.',
      },
    },
  },
  { timestamps: true }
);

customerSchema.index({ 'filterSchedules.nextChangeAt': 1 });
customerSchema.index({ name: 1 });

export default mongoose.models.Customer ||
  mongoose.model('Customer', customerSchema);

