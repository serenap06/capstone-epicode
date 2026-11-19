// import
const mongoose = require("mongoose");
const Sale = require("../sales/schema");
const round = require("../../utils/round");

// incassi del periodo per il Report: andamento, pagamenti, IVA e prodotti venduti
const findRevenue = async ({ from, to, groupBy = "day", store }) => {
  // 1. filtro: vendite non annullate tra from e to (eventualmente di un negozio).
  // Se "to" è solo un giorno ("2026-11-30") arrivo alla fine di quel giorno
  const toDate = new Date(to);
  if (to.length === 10) toDate.setHours(23, 59, 59, 999);

  const match = {
    createdAt: { $gte: new Date(from), $lte: toDate },
    cancelled: { $ne: true },
  };
  if (store) match.store = new mongoose.Types.ObjectId(store);

  // 2. incassi per periodo: $dateTrunc porta ogni vendita all'inizio del giorno,
  // della settimana (dal lunedì) o del mese, con l'ora italiana
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

  // 3. incassi per metodo di pagamento
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

  // 4. incassi e IVA per aliquota
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

  // 5. prodotti venduti, dal più venduto; la categoria la prendo dal prodotto ($lookup)
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
    // vuoto se il prodotto è stato eliminato
    category: row.productData[0]?.category ?? "",
    quantity: row.quantity,
    revenue: round(row.revenue),
  }));

  // 6. totali del periodo, sommando la serie
  const totals = {
    revenue: round(series.reduce((sum, row) => sum + row.revenue, 0)),
    netRevenue: round(series.reduce((sum, row) => sum + row.netRevenue, 0)),
    vat: round(series.reduce((sum, row) => sum + row.vat, 0)),
    salesCount: series.reduce((sum, row) => sum + row.salesCount, 0),
  };

  // 7. risposta con le cifre arrotondate
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
    // i cinque più venduti
    topProducts: soldProducts.slice(0, 5),
    soldProducts,
  };
};

module.exports = { findRevenue };
