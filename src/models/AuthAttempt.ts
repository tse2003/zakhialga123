import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  key: { type: String, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, expires: 0 },
});
export default mongoose.models.AuthAttempt ||
  mongoose.model("AuthAttempt", schema);
