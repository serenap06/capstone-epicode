const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
    },
  },
  { timestamps: true, strict: true },
);

module.exports = mongoose.model("Store", storeSchema, "stores");
