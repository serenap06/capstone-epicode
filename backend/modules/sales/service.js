// import
const mongoose = require("mongoose");
const Product = require("../products/schema");
const Sale = require("./schema");
const Stock = require("../stock/schema");
const HttpException = require("../../exceptions/index");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const round = require("../../utils/round");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// colonne ordinabili: nome nella query → campo (storeName, sellerName e itemCount li creo nella pipeline)
const SORT_FIELDS = {
  date: "createdAt",
  store: "storeName",
  seller: "sellerName",
  items: "itemCount",
  payment: "paymentMethod",
  total: "total",
};

// in aggregate gli id li converto io in ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

// $lookup: il documento collegato con solo i campi scelti (mai la password); $unwind lo toglie dall'array
const lookupOne = (from, localField, fields) => [
  {
    $lookup: {
      from,
      localField,
      foreignField: "_id",
      as: localField,
      pipeline: [{ $project: fields }],
    },
  },
  // preserveNullAndEmptyArrays: tengo la vendita anche se il campo manca
  { $unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true } },
];

// elenco delle vendite: una pagina, il numero di pagine e i totali
const findAll = async (
  {
    store,
    soldBy,
    from,
    to,
    status,
    sortBy = "date",
    order = "desc",
    page = 1,
    limit = 10,
  },
  currentUser,
) => {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // filtro di base: negozio, venditore e periodo (per lista e totali)
  const storeId = currentUser.role === "employee" ? currentUser.store : store;
  const baseFilter = {};
  if (storeId) baseFilter.store = toObjectId(storeId);
  if (soldBy) baseFilter.soldBy = toObjectId(soldBy);
  if (from) baseFilter.createdAt = { $gte: new Date(from) };
  if (to) {
    // "to" solo giorno ("2026-11-30"): arrivo alla fine di quel giorno
    const toDate = new Date(to);
    if (to.length === 10) toDate.setHours(23, 59, 59, 999);
    baseFilter.createdAt = { ...baseFilter.createdAt, $lte: toDate };
  }

  // filtro della lista: più lo stato (valide o annullate); $ne: true prende anche le vendite senza il campo
  const listFilter = { ...baseFilter };
  if (status === "valid") listFilter.cancelled = { $ne: true };
  if (status === "cancelled") listFilter.cancelled = true;

  // ordine: 1 crescente, -1 decrescente; a parità le più recenti
  const direction = order === "asc" ? 1 : -1;
  const sortField = SORT_FIELDS[sortBy];
  const sortStage = { [sortField]: direction };
  if (sortField !== "createdAt") sortStage.createdAt = -1;
  sortStage._id = -1;

  // quattro richieste insieme: la pagina, quante sono (per le pagine),
  // le valide (per i totali) e quante annullate (per il filtro "Annullate")
  const [sales, salesCount, validSales, cancelledCount] = await Promise.all([
    Sale.aggregate([
      { $match: listFilter },
      ...lookupOne("stores", "store", { name: 1 }),
      ...lookupOne("users", "soldBy", { name: 1, surname: 1 }),
      ...lookupOne("users", "cancelledBy", { name: 1, surname: 1 }),
      // campi per ordinare: negozio, venditore (cognome e nome) e pezzi
      {
        $addFields: {
          storeName: "$store.name",
          sellerName: { $concat: ["$soldBy.surname", " ", "$soldBy.name"] },
          itemCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: sortStage },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
    ])
      // collation italiana: niente differenze tra maiuscole e accenti
      .collation({ locale: "it" }),
    Sale.countDocuments(listFilter),
    Sale.find({ ...baseFilter, cancelled: { $ne: true } })
      .select("total netTotal vatTotal paymentMethod")
      .lean(),
    Sale.countDocuments({ ...baseFilter, cancelled: true }),
  ]);

  // somma dei totali
  const sumTotal = (salesList) =>
    round(salesList.reduce((sum, sale) => sum + sale.total, 0));

  const totals = {
    count: validSales.length,
    revenue: sumTotal(validSales),
    netRevenue: round(validSales.reduce((sum, sale) => sum + sale.netTotal, 0)),
    vat: round(validSales.reduce((sum, sale) => sum + sale.vatTotal, 0)),
    cashRevenue: sumTotal(
      validSales.filter((sale) => sale.paymentMethod === "cash"),
    ),
    cardRevenue: sumTotal(
      validSales.filter((sale) => sale.paymentMethod === "card"),
    ),
    cancelledCount,
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

// nuova vendita: controllo prodotti e pezzi, calcolo totali e IVA, scalo le giacenze
// e restituisco i prodotti finiti sotto soglia
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

// annullo una vendita: solo chi l'ha fatta, solo di oggi, una volta sola.
// La vendita resta (con il motivo) e i pezzi tornano nel negozio
const cancel = async (saleId, reason, currentUser) => {
  const sale = await Sale.findById(saleId);
  if (!sale) {
    throw new NotFoundException("Sale not found");
  }
  // confronto gli id come testo
  if (sale.soldBy.toString() !== currentUser._id.toString()) {
    throw new ForbiddenException("You can only cancel your own sales");
  }
  if (sale.cancelled) {
    throw new HttpException("Sale already cancelled", 400);
  }

  // mezzanotte di oggi: le vendite prima non si annullano
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (sale.createdAt < startOfToday) {
    throw new HttpException("Only today's sales can be cancelled", 400);
  }

  // rimetto i pezzi nelle giacenze
  await Promise.all(
    sale.items.map((item) =>
      Stock.updateOne(
        { store: sale.store, product: item.product },
        { $inc: { amount: item.quantity } },
      ),
    ),
  );

  // segno chi, quando e perché
  sale.cancelled = true;
  sale.cancelReason = reason;
  sale.cancelledBy = currentUser._id;
  sale.cancelledAt = new Date();
  await sale.save();

  return sale;
};

module.exports = { findAll, create, cancel };
