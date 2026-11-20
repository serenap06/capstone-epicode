// import
const mongoose = require("mongoose");

// schema della cassa di un giorno: apertura con il fondo cassa, chiusura con imbustato, fondo di chiusura e POS
const cashSessionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    // giorno della cassa (la mezzanotte, ora italiana)
    day: { type: Date, required: true },
    // apertura: il fondo cassa e chi l'ha aperta (l'ora è createdAt)
    openingFloat: { type: Number, required: true, min: 0 },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // chiusura: vuoti finché la cassa è aperta
    closingFloat: { type: Number, min: 0 },
    envelopeAmount: { type: Number, min: 0 },
    // incasso contanti, totale contanti (fondo + incasso) e differenza con quelli contati
    cashSales: { type: Number, min: 0 },
    expectedCash: { type: Number },
    difference: { type: Number },
    // POS: vendite con carta, totale dello scontrino di chiusura del terminale e differenza tra i due
    cardSales: { type: Number, min: 0 },
    posAmount: { type: Number, min: 0 },
    posDifference: { type: Number },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closedAt: { type: Date },
  },
  { timestamps: true },
);

// una sola cassa per negozio al giorno
cashSessionSchema.index({ store: 1, day: 1 }, { unique: true });

// modello CashSession
module.exports = mongoose.model("CashSession", cashSessionSchema);
