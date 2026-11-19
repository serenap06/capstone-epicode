const mongoose = require("mongoose");
const Sale = require("../sales/schema");
const round = require("../../utils/round");

const findRevenue = async ({ from, to, groupBy = "day", store }) => {
  // 1. Filtro: vendite tra from e to, non annullate, eventualmente di un solo negozio.
  // Se "to" è solo un giorno ("2026-11-30") arrivo alla fine di quel giorno;
  // se ha già l'ora (il frontend manda le 23:59 italiane) la uso così com'è
  const toDate = new Date(to);
  if (to.length === 10) toDate.setHours(23, 59, 59, 999);

  const match = {
    createdAt: { $gte: new Date(from), $lte: toDate },
    cancelled: { $ne: true },
  };
  if (store) match.store = new mongoose.Types.ObjectId(store);

  // 2. Incassi per periodo: $dateTrunc porta ogni vendita all'inizio del suo giorno,
  // della sua settimana (dal lunedì) o del suo mese, con l'ora italiana.
  // Il risultato è una data: il frontend ci scrive l'etichetta ("17 nov", "nov")
  const series = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: "$createdAt",
            unit: groupBy,
            timezone: "Europe/Rome",
            startOfWeek: "monday",
          },
        },
        revenue: { $sum: "$total" },
        netRevenue: { $sum: "$netTotal" },
        vat: { $sum: "$vatTotal" },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 3. Incassi per metodo di pagamento
  const payments = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$paymentMethod",
        revenue: { $sum: "$total" },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 4. Incassi e IVA per aliquota
  const vatRates = await Sale.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.vatRate",
        revenue: {
          $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] },
        },
        vat: { $sum: "$items.vatAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 5. Tutti i prodotti venduti nel periodo, dal più venduto: pezzi, incasso e categoria.
  // La vendita salva il nome ma non la categoria: la prendo dal prodotto ($lookup)
  const products = await Sale.aggregate([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] },
        },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productData",
        pipeline: [{ $project: { category: 1 } }],
      },
    },
    { $sort: { quantity: -1, revenue: -1 } },
  ]);
  const soldProducts = products.map((row) => ({
    product: row._id,
    name: row.name,
    // productData è vuoto se il prodotto è stato eliminato dal catalogo
    category: row.productData[0]?.category ?? "",
    quantity: row.quantity,
    revenue: round(row.revenue),
  }));

  // 6. Totali dell'intervallo, sommando le righe della serie
  const totals = {
    revenue: round(series.reduce((sum, row) => sum + row.revenue, 0)),
    netRevenue: round(series.reduce((sum, row) => sum + row.netRevenue, 0)),
    vat: round(series.reduce((sum, row) => sum + row.vat, 0)),
    salesCount: series.reduce((sum, row) => sum + row.salesCount, 0),
  };

  // 7. Risposta, con nomi chiari e cifre arrotondate
  return {
    totals,
    series: series.map((row) => ({
      period: row._id,
      revenue: round(row.revenue),
      netRevenue: round(row.netRevenue),
      vat: round(row.vat),
      salesCount: row.salesCount,
    })),
    byPayment: payments.map((row) => ({
      paymentMethod: row._id,
      revenue: round(row.revenue),
      salesCount: row.salesCount,
    })),
    byVatRate: vatRates.map((row) => {
      const revenue = round(row.revenue);
      const vat = round(row.vat);
      return {
        vatRate: row._id,
        revenue,
        netRevenue: round(revenue - vat),
        vat,
      };
    }),
    // i cinque più venduti sono i primi dell'elenco completo
    topProducts: soldProducts.slice(0, 5),
    soldProducts,
  };
};

module.exports = { findRevenue };
