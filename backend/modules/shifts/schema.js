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
// la fine deve venire dopo l'inizio (con Mongoose 9 niente next: basta invalidate)
shiftSchema.pre("validate", function () {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    this.invalidate("endAt", "endAt must be later than startAt");
  }
});

// indice per le ricerche più frequenti: turni di un negozio in un periodo
shiftSchema.index({ store: 1, startAt: 1 });

module.exports = mongoose.model("Shift", shiftSchema, "shifts");
