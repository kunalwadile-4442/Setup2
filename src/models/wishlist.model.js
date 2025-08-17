import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
      }
    ]
  },
  { timestamps: true }
);

// ✅ Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// ✅ Fast lookup for "product exists in wishlist"
wishlistSchema.index({ user: 1, "items.product": 1 });

wishlistSchema.plugin(aggregatePaginate);
export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
