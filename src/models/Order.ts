import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    requestKey: { type: String, unique: true, sparse: true },
    accountId: { type: Schema.Types.ObjectId, index: true },
    amount: Number,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    invoiceId: String,
    invoiceState: String,
    qrImage: String,
    bankLinks: { type: [Schema.Types.Mixed], default: [] },
    paidAt: Date,
    productName: { type: String, required: true },
    optionName: { type: String, default: "" },
    price: { type: String, default: "" },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "confirmed", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
