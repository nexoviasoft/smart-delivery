import mongoose from "mongoose";

<<<<<<< HEAD
const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

=======
>>>>>>> 790594a (update)
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
<<<<<<< HEAD
    orderItems: { type: [orderItemSchema], default: [] },
=======
>>>>>>> 790594a (update)
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
