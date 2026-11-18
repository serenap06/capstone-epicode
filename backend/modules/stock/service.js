const mongoose = require("mongoose");
const Stock = require("./schema");
const Product = require("../products/schema");
const Store = require("../stores/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const buildPagination = require("../../utils/buildPagination");
const escapeRegex = require("../../utils/escapeRegex");

// le colonne che si possono ordinare: il nome che arriva nella query → il campo da ordinare
// (productName, storeName e isLow li aggiungo io nella pipeline)
const SORT_FIELDS = {
  product: "productName",
  store: "storeName",
  amount: "amount",
  minThreshold: "minThreshold",
  status: "isLow",
};

// il dipendente vede solo il suo negozio; lowStock: solo quantità <= soglia.
// Senza page restituisce tutte le giacenze (le usano Cassa, Dashboard e i moduli);
// con page una pagina sola, cercata e ordinata dal server, più i totali per il sottotitolo
const findAll = async (filters, currentUser) => {
  const {
    store,
    product,
    lowStock,
    search,
    sortBy = "product",
    order = "asc",
    page,
    limit = 10,
  } = filters;

  // il negozio: per il dipendente sempre il suo. ObjectId perché aggregate non converte gli id
  const scope = {};
  if (currentUser.role === "employee") {
    scope.store = new mongoose.Types.ObjectId(String(currentUser.store));
  } else if (store) {
    scope.store = new mongoose.Types.ObjectId(String(store));
  }
  const query = { ...scope };
  if (product) query.product = new mongoose.Types.ObjectId(String(product));
  if (lowStock) query.$expr = { $lte: ["$amount", "$minThreshold"] };

  // senza page: tutte, come prima
  if (!page) {
    const stocks = await Stock.find(query)
      .populate("product", "name price category image")
      .populate("store", "name");
    return { stocks };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // ordine: 1 crescente, -1 decrescente; a parità, prodotto e negozio dalla A alla Z
  const direction = order === "desc" ? -1 : 1;
  const sortStage = { [SORT_FIELDS[sortBy]]: direction };
  if (sortBy !== "product") sortStage.productName = 1;
  if (sortBy !== "store") sortStage.storeName = 1;
  sortStage._id = 1;

  // tre richieste insieme:
  // 1. la pagina: unisco prodotto e negozio ($lookup), cerco nel nome del prodotto,
  //    ordino e taglio; $facet conta anche quante righe passano i filtri, per le pagine
  // 2. e 3. quante righe ha il negozio (o tutti) e quante sono sotto soglia, per il sottotitolo
  const [[result], count, lowCount] = await Promise.all([
    Stock.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
          pipeline: [
            { $project: { name: 1, price: 1, category: 1, image: 1 } },
          ],
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "stores",
          localField: "store",
          foreignField: "_id",
          as: "store",
          pipeline: [{ $project: { name: 1 } }],
        },
      },
      { $unwind: "$store" },
      // ricerca nel nome del prodotto; "i": maiuscole e minuscole uguali
      ...(search
        ? [
            {
              $match: {
                "product.name": { $regex: escapeRegex(search), $options: "i" },
              },
            },
          ]
        : []),
      // i campi su cui ordinare; isLow: 1 sotto soglia, 0 ok (crescente = prima gli ok)
      {
        $addFields: {
          productName: "$product.name",
          storeName: "$store.name",
          isLow: { $cond: [{ $lte: ["$amount", "$minThreshold"] }, 1, 0] },
        },
      },
      {
        $facet: {
          stocks: [
            { $sort: sortStage },
            { $skip: (pageNumber - 1) * limitNumber },
            { $limit: limitNumber },
          ],
          total: [{ $count: "count" }],
        },
      },
    ])
      // collation italiana: ordina i nomi senza badare a maiuscole e accenti
      .collation({ locale: "it" }),
    Stock.countDocuments(scope),
    Stock.countDocuments({
      ...scope,
      $expr: { $lte: ["$amount", "$minThreshold"] },
    }),
  ]);

  // total è vuoto quando nessuna riga passa i filtri
  const filteredCount = result.total[0]?.count ?? 0;
  return {
    stocks: result.stocks,
    totals: { count, lowCount },
    pagination: buildPagination(pageNumber, limitNumber, filteredCount),
  };
};

const findOne = async (stockId, currentUser) => {
  const stock = await Stock.findById(stockId)
    .populate("product", "name price category image")
    .populate("store", "name");

  if (
    !stock ||
    (currentUser.role === "employee" &&
      stock.store._id.toString() !== currentUser.store.toString())
  ) {
    throw new NotFoundException("Stock not found");
  }
  return stock;
};

// prima controllo che prodotto e negozio esistano
const create = async (stockData) => {
  const productExists = await Product.exists({ _id: stockData.product });
  if (!productExists) {
    throw new NotFoundException("Product not found");
  }
  const storeExists = await Store.exists({ _id: stockData.store });
  if (!storeExists) {
    throw new NotFoundException("Store not found");
  }
  const stock = new Stock(stockData);
  return await stock.save();
};

const update = async (stockId, stockData) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new NotFoundException("Stock not found");
  }
  assignDefinedFields(stock, stockData);
  return await stock.save();
};

const deleteStock = async (stockId) => {
  const deletedStock = await Stock.findByIdAndDelete(stockId);
  if (!deletedStock) {
    throw new NotFoundException("Stock not found");
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteStock,
};
