import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false } // no need for separate _id for each item
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ each user has only ONE cart
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Text index for searching by name
cartSchema.index({ name: "text" });
cartSchema.plugin(aggregatePaginate);


export default mongoose.model("Cart", cartSchema);