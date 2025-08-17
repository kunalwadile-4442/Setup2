import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true }, // Address line 1 (required)
    line2: { type: String }, // Address line 2 (optional)
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }, // One default address
  },
  { timestamps: true }
);

// Ensure user cannot save more than 3 addresses
addressSchema.pre("save", async function (next) {
  const count = await mongoose.model("Address").countDocuments({ userId: this.userId });
  if (count >= 3 && this.isNew) {
    return next(new Error("You can only store up to 3 addresses"));
  }
  next();
});

addressSchema.plugin(aggregatePaginate);

export default mongoose.model("Address", addressSchema);