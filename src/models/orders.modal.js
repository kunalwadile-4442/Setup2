import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true }, // denormalized for quick access
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }, // product thumbnail
      },
    ],

    shippingAddress:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card", "NetBanking", "Wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",     // placed but not processed
        "processing",  // preparing / packing
        "shipped",     // shipped to user
        "delivered",   // successfully delivered
        "cancelled",   // cancelled by user/admin
      ],
      default: "pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Get current year
    const year = new Date().getFullYear();

    // Count existing orders for this year
    const count = await mongoose.model("Order").countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });

    // Generate sequential order number
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// 📌 Compound index: user + createdAt (for fast order history lookup)
orderSchema.index({ userId: 1, createdAt: -1 });

// 📌 Compound index: status + createdAt (admin dashboard filtering)
orderSchema.index({ status: 1, createdAt: -1 });

// 📌 Optional: If you search by orderId frequently (like "ORD123")

orderSchema.plugin(aggregatePaginate);


export default mongoose.model("Order", orderSchema);