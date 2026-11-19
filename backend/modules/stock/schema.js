// import
const mongoose = require("mongoose");

// schema della giacenza: un prodotto in un negozio
const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
      default: 0,
      min: 0,
    },
    // sotto questa quantità il prodotto è "sotto soglia"
    minThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
  },
  { timestamps: true, strict: true },
);
// una sola giacenza per prodotto e negozio
stockSchema.index({ product: 1, store: 1 }, { unique: true });

// modello Stock, collection "stocks"
module.exports = mongoose.model("Stock", stockSchema, "stocks");
