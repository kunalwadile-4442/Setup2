import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  name: { type: String, required: true },
  description: String
}, { timestamps: true });

subcategorySchema.index({ categoryId: 1 });
subcategorySchema.index({ name: "text" });

export default mongoose.model("Subcategory", subcategorySchema);