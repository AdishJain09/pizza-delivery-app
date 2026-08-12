import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    vegetables: [{ type: String }],
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"],
      default: "Order Received"
    },
    paymentId: String,
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
