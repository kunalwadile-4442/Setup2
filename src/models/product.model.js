import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    subcategory: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product image is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);
productSchema.plugin(aggregatePaginate);

const Product = mongoose.model("Product", productSchema);

export default Product;
