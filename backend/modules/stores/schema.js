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
      trim: true,
      unique: true,
    },
    city: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

storeSchema.virtual("users", {
  ref: "User",
  localField: "_id",
  foreignField: "store",
});

module.exports = mongoose.model("Store", storeSchema, "stores");
