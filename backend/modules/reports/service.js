const mongoose = require("mongoose");
const Sale = require("../sales/schema");

const PERIOD_FORMATS = {
  day: "%Y-%m-%d",
  week: "%G-W%V",
  month: "%Y-%m",
};

const round = (value) => Math.round(value * 100) / 100;

const findRevenue = async ({ from, to, groupBy = "day", store }) => {
  // 1. Filtro: vendite tra from e to, eventualmente di un solo negozio
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const match = { createdAt: { $gte: new Date(from), $lte: toDate } };
  if (store) match.store = new mongoose.Types.ObjectId(store);

  // 2. Incassi per periodo (giorno, settimana o mese)
  const series = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: PERIOD_FORMATS[groupBy],
            date: "$createdAt",
            timezone: "Europe/Rome",
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

  // 5. I cinque prodotti più venduti
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
    { $sort: { quantity: -1, revenue: -1 } },
    { $limit: 5 },
  ]);

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
    topProducts: products.map((row) => ({
      product: row._id,
      name: row.name,
      quantity: row.quantity,
      revenue: round(row.revenue),
    })),
  };
};

module.exports = { findRevenue };