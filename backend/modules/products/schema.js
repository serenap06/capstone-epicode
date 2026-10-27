const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    image: {
      type: String,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    brand: {
      type: String,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true, strict: true },
);

module.exports = mongoose.model("Product", productSchema, "products");
