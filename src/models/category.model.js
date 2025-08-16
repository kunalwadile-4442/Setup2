import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Reference to User model
  },
  { timestamps: true }
);

// Text index for searching by name
categorySchema.index({ name: "text" });
categorySchema.plugin(aggregatePaginate);


export default mongoose.model("Category", categorySchema);