const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, strict: true },
);
shiftSchema.path("endAt").validate(function (value) {
  return value > this.startAt;
});

module.exports = mongoose.model("Shift", shiftSchema, "shifts");
