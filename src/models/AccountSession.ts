import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  tokenHash: { type: String, unique: true },
  accountId: { type: Schema.Types.ObjectId, required: true },
  expiresAt: { type: Date, expires: 0 },
});
export default mongoose.models.AccountSession ||
  mongoose.model("AccountSession", schema);
