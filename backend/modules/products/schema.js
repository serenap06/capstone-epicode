// import
const mongoose = require("mongoose");

// schema del prodotto
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // link della foto su Cloudinary
    image: {
      type: String,
    },
    // non attivo: lo vede solo il responsabile
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    brand: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    // sempre in minuscolo, così "Libri" e "libri" sono la stessa categoria
    category: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
      lowercase: true,
    },
    // aliquota IVA in percentuale
    vatRate: {
      type: Number,
      enum: [4, 5, 10, 22],
      default: 22,
    },
  },
  { timestamps: true, strict: true },
);

// modello Product, collection "products"
module.exports = mongoose.model("Product", productSchema, "products");
