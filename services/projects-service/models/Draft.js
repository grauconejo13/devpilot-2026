import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
  featureId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Draft", draftSchema);