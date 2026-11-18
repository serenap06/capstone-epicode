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
    requestedAmount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "amount must be an integer",
      },
    },
    // open = in attesa, handled = accolta, rejected = respinta (con il motivo)
    state: {
      type: String,
      enum: ["open", "handled", "rejected"],
      default: "open",
    },
    // chi ha deciso (il responsabile) e quando: si riempiono quando la richiesta viene
    // accolta o respinta
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    handledAt: { type: Date },
    // il motivo, solo per le respinte: il dipendente lo legge nell'elenco
    rejectReason: { type: String, trim: true },
  },
  { timestamps: true, strict: true },
);

module.exports = mongoose.model(
  "SupplyRequest",
  supplyRequestSchema,
  "supplyRequests",
);
