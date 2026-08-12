import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["base", "sauce", "cheese", "vegetable"],
      required: true
    },
    name: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 20 },
    lowStockAlertSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
