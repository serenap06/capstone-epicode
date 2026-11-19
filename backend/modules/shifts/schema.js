// import
const mongoose = require("mongoose");

// schema del turno
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
// la fine deve venire dopo l'inizio
shiftSchema.pre("validate", function () {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    this.invalidate("endAt", "endAt must be later than startAt");
  }
});

// indice per la ricerca più frequente: turni di un negozio in un periodo
shiftSchema.index({ store: 1, startAt: 1 });

// modello Shift, collection "shifts"
module.exports = mongoose.model("Shift", shiftSchema, "shifts");
