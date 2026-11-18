const Product = require("../products/schema");
const Sale = require("./schema");
const Stock = require("../stock/schema");
const HttpException = require("../../exceptions/index");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const round = require("../../utils/round");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

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

  // tre richieste insieme:
  // 1. una pagina di vendite per la tabella, annullate comprese (il responsabile vede il motivo)
  // 2. quante sono in tutto, per contare le pagine
  // 3. solo le non annullate ($ne: true prende anche le vecchie senza il campo), per i totali
  const [sales, salesCount, validSales] = await Promise.all([
    Sale.find(filter)
      .populate("store", "name")
      .populate("soldBy", "name surname")
      .populate("cancelledBy", "name surname")
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Sale.countDocuments(filter),
    Sale.find({ ...filter, cancelled: { $ne: true } })
      .select("total netTotal vatTotal")
      .lean(),
  ]);
  const totals = {
    count: validSales.length,
    revenue: round(validSales.reduce((sum, sale) => sum + sale.total, 0)),
    netRevenue: round(validSales.reduce((sum, sale) => sum + sale.netTotal, 0)),
    vat: round(validSales.reduce((sum, sale) => sum + sale.vatTotal, 0)),
  };

  return {
    sales,
    totals,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(salesCount / limitNumber),
    },
  };
};

// registra una vendita: controlla prodotti e giacenze, calcola totali e IVA,
// scala le giacenze e restituisce anche i prodotti finiti sotto soglia
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
    const stock = stocks.find(
      (storeStock) => storeStock.product.toString() === item.product,
    );
    return !stock || stock.amount < item.quantity;
  });
  if (unavailableItems.length > 0) {
    const names = unavailableItems.map(
      (item) =>
        products.find((product) => product._id.toString() === item.product)
          .name,
    );
    throw new HttpException(`Not enough stock for: ${names.join(", ")}`, 400);
  }
  const saleItems = items.map((item) => {
    const product = products.find(
      (foundProduct) => foundProduct._id.toString() === item.product,
    );
    const lineTotal = product.price * item.quantity;

    return {
      product: product._id,
      name: product.name,
      unitPrice: product.price,
      vatRate: product.vatRate,
      quantity: item.quantity,
      // il prezzo comprende l'IVA: IVA = totale - totale / (1 + aliquota)
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

// annulla una vendita: solo chi l'ha fatta, solo se è di oggi e non è già annullata.
// La vendita resta nel database (il responsabile vede il motivo) e i pezzi tornano nel negozio
const cancel = async (saleId, reason, currentUser) => {
  const sale = await Sale.findById(saleId);
  if (!sale) {
    throw new NotFoundException("Sale not found");
  }
  // gli id di Mongo sono oggetti: con toString() confronto il testo
  if (sale.soldBy.toString() !== currentUser._id.toString()) {
    throw new ForbiddenException("You can only cancel your own sales");
  }
  if (sale.cancelled) {
    throw new HttpException("Sale already cancelled", 400);
  }

  // l'inizio di oggi (mezzanotte): una vendita fatta prima non si annulla più
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (sale.createdAt < startOfToday) {
    throw new HttpException("Only today's sales can be cancelled", 400);
  }

  // il contrario di create: ogni riga rimette i suoi pezzi nella giacenza del negozio
  await Promise.all(
    sale.items.map((item) =>
      Stock.updateOne(
        { store: sale.store, product: item.product },
        { $inc: { amount: item.quantity } },
      ),
    ),
  );

  // la segno come annullata: chi, quando e perché
  sale.cancelled = true;
  sale.cancelReason = reason;
  sale.cancelledBy = currentUser._id;
  sale.cancelledAt = new Date();
  await sale.save();

  return sale;
};

module.exports = { findAll, create, cancel };
