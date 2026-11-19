// import
const mongoose = require("mongoose");

// schema del negozio
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
    // toJSON e toObject con i virtuali: così users arriva anche al frontend
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// campo virtuale (non salvato): con populate("users") porta le persone del negozio
storeSchema.virtual("users", {
  ref: "User",
  localField: "_id",
  foreignField: "store",
});

// modello Store, collection "stores"
module.exports = mongoose.model("Store", storeSchema, "stores");
