// import
const mongoose = require("mongoose");
const Stock = require("./schema");
const Product = require("../products/schema");
const Store = require("../stores/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const buildPagination = require("../../utils/buildPagination");
const escapeRegex = require("../../utils/escapeRegex");

// colonne ordinabili: nome nella query → campo (productName, storeName e isLow li creo nella pipeline)
const SORT_FIELDS = {
  product: "productName",
  store: "storeName",
  amount: "amount",
  minThreshold: "minThreshold",
  status: "isLow",
};

// giacenze: il dipendente vede solo il suo negozio; lowStock = solo sotto soglia.
// Senza page tutte (Cassa, Dashboard, moduli); con page una pagina e i totali
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

  // negozio: per il dipendente sempre il suo (ObjectId per aggregate)
  const scope = {};
  if (currentUser.role === "employee") {
    scope.store = new mongoose.Types.ObjectId(String(currentUser.store));
  } else if (store) {
    scope.store = new mongoose.Types.ObjectId(String(store));
  }
  const query = { ...scope };
  if (product) query.product = new mongoose.Types.ObjectId(String(product));
  if (lowStock) query.$expr = { $lte: ["$amount", "$minThreshold"] };

  // senza page: tutte
  if (!page) {
    const stocks = await Stock.find(query)
      .populate("product", "name price category image")
      .populate("store", "name");
    return { stocks };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // ordine: 1 crescente, -1 decrescente; a parità prodotto e negozio A→Z
  const direction = order === "desc" ? -1 : 1;
  const sortStage = { [SORT_FIELDS[sortBy]]: direction };
  if (sortBy !== "product") sortStage.productName = 1;
  if (sortBy !== "store") sortStage.storeName = 1;
  sortStage._id = 1;

  // tre richieste insieme: la pagina (con prodotto e negozio, ricerca, ordine e conteggio),
  // quante righe in tutto e quante sotto soglia
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
      // ricerca nel nome del prodotto
      ...(search
        ? [
            {
              $match: {
                "product.name": { $regex: escapeRegex(search), $options: "i" },
              },
            },
          ]
        : []),
      // campi per ordinare; isLow: 1 sotto soglia, 0 ok
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
      // collation italiana: niente differenze tra maiuscole e accenti
      .collation({ locale: "it" }),
    Stock.countDocuments(scope),
    Stock.countDocuments({
      ...scope,
      $expr: { $lte: ["$amount", "$minThreshold"] },
    }),
  ]);

  // total è vuoto se nessuna riga passa i filtri
  const filteredCount = result.total[0]?.count ?? 0;
  return {
    stocks: result.stocks,
    totals: { count, lowCount },
    pagination: buildPagination(pageNumber, limitNumber, filteredCount),
  };
};

// una giacenza (il dipendente solo del suo negozio)
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

// nuova giacenza: prima controllo che prodotto e negozio esistano
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

// cambio quantità e soglia
const update = async (stockId, stockData) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new NotFoundException("Stock not found");
  }
  assignDefinedFields(stock, stockData);
  return await stock.save();
};

// elimino la giacenza
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
