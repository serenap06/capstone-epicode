const Product = require("../products/schema");
const Sale = require("./schema");
const Stock = require("../stock/schema");
const HttpException = require("../../exceptions/index");

const round = (value) => Math.round(value * 100) / 100;

const findAll = async (
  { store, soldBy, from, to, page = 1, limit = 20 },
  currentUser,
) => {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const storeId = currentUser.role === "employee" ? currentUser.store : store;
  const filter = {};
  if (storeId) filter.store = storeId;
  if (soldBy) filter.soldBy = soldBy;
  if (from) filter.createdAt = { $gte: new Date(from) };
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    filter.createdAt = { ...filter.createdAt, $lte: toDate };
  }

  const [sales, allSales] = await Promise.all([
    Sale.find(filter)
      .populate("store", "name")
      .populate("soldBy", "name surname")
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Sale.find(filter).select("total netTotal vatTotal").lean(),
  ]);
  const totals = {
    count: allSales.length,
    revenue: round(allSales.reduce((sum, sale) => sum + sale.total, 0)),
    netRevenue: round(allSales.reduce((sum, sale) => sum + sale.netTotal, 0)),
    vat: round(allSales.reduce((sum, sale) => sum + sale.vatTotal, 0)),
  };

  return {
    sales,
    totals,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(allSales.length / limitNumber),
    },
  };
};

const create = async ({ items, paymentMethod }, currentUser) => {
  const productIds = items.map((item) => item.product);
  const products = await Product.find({
    _id: { $in: productIds },
    active: true,
  });
  if (products.length !== productIds.length) {
    throw new HttpException("One or more products are not available", 400);
  }
  const stocks = await Stock.find({
    store: currentUser.store,
    product: { $in: productIds },
  });

  const unavailableItems = items.filter((item) => {
    const stock = stocks.find((s) => s.product.toString() === item.product);
    return !stock || stock.amount < item.quantity;
  });
  if (unavailableItems.length > 0) {
    const names = unavailableItems.map(
      (item) => products.find((p) => p._id.toString() === item.product).name,
    );
    throw new HttpException(`Not enough stock for: ${names.join(", ")}`, 400);
  }
  const saleItems = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.product);
    const lineTotal = product.price * item.quantity;

    return {
      product: product._id,
      name: product.name,
      unitPrice: product.price,
      vatRate: product.vatRate,
      quantity: item.quantity,
      vatAmount: round(lineTotal - lineTotal / (1 + product.vatRate / 100)),
    };
  });

  const total = round(
    saleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  const vatTotal = round(
    saleItems.reduce((sum, item) => sum + item.vatAmount, 0),
  );
  const netTotal = round(total - vatTotal);

  await Promise.all(
    items.map((item) =>
      Stock.updateOne(
        { store: currentUser.store, product: item.product },
        { $inc: { amount: -item.quantity } },
      ),
    ),
  );

  const sale = await Sale.create({
    store: currentUser.store,
    soldBy: currentUser._id,
    items: saleItems,
    total,
    netTotal,
    vatTotal,
    paymentMethod,
  });

  const lowStocks = await Stock.find({
    store: currentUser.store,
    product: { $in: productIds },
    $expr: { $lte: ["$amount", "$minThreshold"] },
  }).populate("product", "name");

  const lowStock = lowStocks.map((stock) => ({
    product: stock.product._id,
    name: stock.product.name,
    amount: stock.amount,
    minThreshold: stock.minThreshold,
  }));

  return { sale, lowStock };
};

module.exports = { findAll, create };
