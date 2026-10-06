import mongoose, { Schema } from "mongoose";
const schema = new Schema(
  {
    name: String,
    phone: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);
export default mongoose.models.Account || mongoose.model("Account", schema);
