// import
const mongoose = require("mongoose");
const CashSession = require("./schema");
const Sale = require("../sales/schema");
const HttpException = require("../../exceptions/index");
const round = require("../../utils/round");

// mezzanotte di oggi: il giorno della cassa
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// incasso del negozio da quel giorno con un metodo di pagamento (solo vendite valide)
const sumSales = async (storeId, day, paymentMethod) => {
  const sales = await Sale.find({
    store: storeId,
    paymentMethod,
    cancelled: { $ne: true },
    createdAt: { $gte: day },
  })
    .select("total")
    .lean();
  return round(sales.reduce((sum, sale) => sum + sale.total, 0));
};

// cassa di oggi (null se da aprire), ultimo fondo di chiusura e incasso di oggi in contanti e POS
const findToday = async (currentUser) => {
  const today = getToday();
  const [cashSession, lastClosedSession, cashSales, cardSales] =
    await Promise.all([
      CashSession.findOne({ store: currentUser.store, day: today }).populate(
        "openedBy closedBy",
        "name surname",
      ),
      // ultima cassa chiusa: il suo fondo di chiusura è il fondo di partenza
      CashSession.findOne({
        store: currentUser.store,
        closedAt: { $exists: true },
      }).sort({ day: -1 }),
      sumSales(currentUser.store, today, "cash"),
      sumSales(currentUser.store, today, "card"),
    ]);

  return {
    cashSession,
    lastClosingFloat: lastClosedSession?.closingFloat ?? 0,
    cashSales,
    cardSales,
  };
};

// casse di un periodo dalla più vecchia; floatMismatch = fondo di apertura diverso dall'ultima chiusura
const findInPeriod = async (storeId, fromDate, toDate) => {
  // in aggregate l'id lo converto io
  const storeFilter = storeId
    ? { store: new mongoose.Types.ObjectId(String(storeId)) }
    : {};

  const [cashSessions, previousClosings] = await Promise.all([
    CashSession.find({ ...storeFilter, day: { $gte: fromDate, $lte: toDate } })
      .populate("store", "name")
      .sort({ day: 1 })
      .lean(),
    // per ogni negozio il fondo dell'ultima cassa chiusa prima del periodo
    CashSession.aggregate([
      {
        $match: {
          ...storeFilter,
          day: { $lt: fromDate },
          closedAt: { $exists: true },
        },
      },
      { $sort: { day: -1 } },
      { $group: { _id: "$store", closingFloat: { $first: "$closingFloat" } } },
    ]),
  ]);

  // negozio → ultimo fondo di chiusura, aggiornato cassa dopo cassa
  const lastClosingFloats = new Map(
    previousClosings.map((row) => [String(row._id), row.closingFloat]),
  );

  return cashSessions.map((cashSession) => {
    const storeKey = String(cashSession.store._id);
    const lastClosingFloat = lastClosingFloats.get(storeKey);
    const floatMismatch =
      lastClosingFloat !== undefined &&
      lastClosingFloat !== cashSession.openingFloat;
    // la sua chiusura diventa l'ultima per la cassa dopo
    if (cashSession.closedAt) {
      lastClosingFloats.set(storeKey, cashSession.closingFloat);
    }
    return { ...cashSession, floatMismatch };
  });
};

// casse di un periodo per le Vendite (il dipendente solo il suo negozio)
const findAll = async ({ from, to, store }, currentUser) => {
  const storeId = currentUser.role === "employee" ? currentUser.store : store;
  // giorni interi: da mezzanotte di from alla fine di to (anche se arrivano senza ora)
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);
  return findInPeriod(storeId, fromDate, toDate);
};

// apro la cassa di oggi con il fondo cassa (una volta sola al giorno)
const open = async ({ openingFloat }, currentUser) => {
  const today = getToday();
  const existingSession = await CashSession.findOne({
    store: currentUser.store,
    day: today,
  });
  if (existingSession) {
    throw new HttpException("Cash register already opened today", 400);
  }

  const cashSession = await CashSession.create({
    store: currentUser.store,
    day: today,
    openingFloat: round(openingFloat),
    openedBy: currentUser._id,
  });
  return cashSession;
};

// chiudo la cassa di oggi: salvo imbustato e fondo di chiusura, calcolo la differenza
const close = async ({ closingFloat, envelopeAmount }, currentUser) => {
  const today = getToday();
  const cashSession = await CashSession.findOne({
    store: currentUser.store,
    day: today,
  });
  if (!cashSession) {
    throw new HttpException("Cash register not opened today", 400);
  }
  if (cashSession.closedAt) {
    throw new HttpException("Cash register already closed", 400);
  }

  // totale contanti = fondo di apertura + incasso contanti; contati = imbustato + fondo di chiusura
  const cashSales = await sumSales(currentUser.store, today, "cash");
  const expectedCash = round(cashSession.openingFloat + cashSales);
  const countedCash = round(closingFloat + envelopeAmount);

  cashSession.closingFloat = round(closingFloat);
  cashSession.envelopeAmount = round(envelopeAmount);
  cashSession.cashSales = cashSales;
  cashSession.expectedCash = expectedCash;
  // positiva = soldi in più, negativa = mancano soldi
  cashSession.difference = round(countedCash - expectedCash);
  cashSession.closedBy = currentUser._id;
  cashSession.closedAt = new Date();
  await cashSession.save();

  return cashSession;
};

// si vende e si annulla solo con la cassa di oggi aperta (lo usano le Vendite)
const checkIsOpen = async (storeId) => {
  const cashSession = await CashSession.findOne({
    store: storeId,
    day: getToday(),
  });
  if (!cashSession) {
    throw new HttpException("Cash register not opened today", 400);
  }
  if (cashSession.closedAt) {
    throw new HttpException("Cash register already closed", 400);
  }
};

module.exports = {
  findToday,
  findInPeriod,
  findAll,
  open,
  close,
  checkIsOpen,
};
