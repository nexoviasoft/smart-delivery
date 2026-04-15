import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerAddress: { type: String, required: true, trim: true },
    codAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "ready", "delivered", "cancelled"],
      default: "ready",
    },
  },
  { timestamps: true }
);

orderSchema.index({ companyId: 1, orderNumber: 1 }, { unique: true });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
