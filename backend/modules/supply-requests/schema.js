const mongoose = require("mongoose");

const supplyRequestSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    state: {
      type: String,
      enum: ["open", "handled"],
      default: "open",
    },
  },
  { timestamps: true, strict: true },
);

module.exports = mongoose.model(
  "SupplyRequest",
  supplyRequestSchema,
  "supplyRequests",
);
