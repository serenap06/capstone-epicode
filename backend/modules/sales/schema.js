const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    vatRate: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    vatAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: { type: [saleItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    netTotal: { type: Number, required: true, min: 0 },
    vatTotal: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "card"], required: true },
    // annullamento: di base false; gli altri tre si riempiono solo quando si annulla
    cancelled: { type: Boolean, default: false },
    cancelReason: { type: String, trim: true },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", saleSchema);
