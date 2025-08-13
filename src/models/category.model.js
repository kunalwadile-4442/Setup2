import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String
}, { timestamps: true });

categorySchema.index({ name: "text" });

export default mongoose.model("Category", categorySchema);