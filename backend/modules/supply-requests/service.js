const mongoose = require("mongoose");
const SupplyRequest = require("./schema");
const Product = require("../products/schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");
const HttpException = require("../../exceptions/index");
const buildPagination = require("../../utils/buildPagination");
const escapeRegex = require("../../utils/escapeRegex");

// le colonne che si possono ordinare: il nome che arriva nella query → il campo da ordinare
// (productName, storeName, requesterName e stateOrder li aggiungo io nella pipeline)
const SORT_FIELDS = {
  product: "productName",
  store: "storeName",
  amount: "requestedAmount",
  requestedBy: "requesterName",
  date: "createdAt",
  state: "stateOrder",
};

// $lookup: prende dalla collection "from" il documento collegato, solo i campi di "fields"
// (mai la password degli utenti). $unwind trasforma l'array del risultato in un oggetto;
// preserveNullAndEmptyArrays tiene la richiesta anche se manca (handledBy c'è solo dopo la decisione)
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
  { $unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true } },
];

// il dipendente vede solo il suo negozio.
// Senza page restituisce tutte le richieste (le usa la pagina per sapere quali prodotti
// sono già in attesa); con page una pagina sola, cercata e ordinata dal server, più i totali
const findAll = async (filters, currentUser) => {
  const {
    store,
    product,
    state,
    search,
    sortBy = "state",
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
  if (state) query.state = state;

  // senza page: tutte, come prima
  if (!page) {
    const supplyRequests = await SupplyRequest.find(query)
      .populate("product", "name price category image")
      .populate("store", "name")
      .populate("requestedBy", "name surname")
      .populate("handledBy", "name surname")
      .sort({ createdAt: -1 });
    return { supplyRequests };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // ordine: 1 crescente, -1 decrescente; a parità, prima le più recenti
  const direction = order === "desc" ? -1 : 1;
  const sortStage = { [SORT_FIELDS[sortBy]]: direction };
  if (sortBy !== "date") sortStage.createdAt = -1;
  sortStage._id = -1;

  // tre richieste insieme:
  // 1. la pagina: unisco prodotto, negozio e persone ($lookup), cerco nel nome del prodotto,
  //    ordino e taglio; $facet conta anche quante richieste passano i filtri, per le pagine
  // 2. e 3. quante richieste ha il negozio (o tutti) e quante sono in attesa, per il sottotitolo
  const [[result], count, openCount] = await Promise.all([
    SupplyRequest.aggregate([
      { $match: query },
      ...lookupOne("products", "product", {
        name: 1,
        price: 1,
        category: 1,
        image: 1,
      }),
      ...lookupOne("stores", "store", { name: 1 }),
      ...lookupOne("users", "requestedBy", { name: 1, surname: 1 }),
      ...lookupOne("users", "handledBy", { name: 1, surname: 1 }),
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
      // i campi su cui ordinare. stateOrder: la posizione dello stato nell'elenco
      // (0 in attesa, 1 accolta, 2 respinta): crescente = prima quelle in attesa
      {
        $addFields: {
          productName: "$product.name",
          storeName: "$store.name",
          requesterName: {
            $concat: ["$requestedBy.surname", " ", "$requestedBy.name"],
          },
          stateOrder: {
            $indexOfArray: [["open", "handled", "rejected"], "$state"],
          },
        },
      },
      {
        $facet: {
          supplyRequests: [
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
    SupplyRequest.countDocuments(scope),
    SupplyRequest.countDocuments({ ...scope, state: "open" }),
  ]);

  // total è vuoto quando nessuna richiesta passa i filtri
  const filteredCount = result.total[0]?.count ?? 0;
  return {
    supplyRequests: result.supplyRequests,
    totals: { count, openCount },
    pagination: buildPagination(pageNumber, limitNumber, filteredCount),
  };
};

const findOne = async (supplyId, currentUser) => {
  const supplyRequest = await SupplyRequest.findById(supplyId)
    .populate("product", "name price category image")
    .populate("requestedBy", "name surname")
    .populate("handledBy", "name surname")
    .populate("store", "name");
  if (
    !supplyRequest ||
    (currentUser.role === "employee" &&
      supplyRequest.store._id.toString() !== currentUser.store.toString())
  ) {
    throw new NotFoundException("Supply Request not found");
  }
  return supplyRequest;
};

// la richiesta la fa il dipendente per il suo negozio, solo per prodotti attivi
const create = async (supplyData, currentUser) => {
  const product = await Product.findById(supplyData.product);
  if (!product || !product.active) {
    throw new NotFoundException("Product not found");
  }
  // una sola richiesta in attesa per prodotto e negozio: la seconda sarebbe un doppione.
  // exists restituisce null se non trova niente
  const openRequest = await SupplyRequest.exists({
    product: supplyData.product,
    store: currentUser.store,
    state: "open",
  });
  if (openRequest) {
    throw new HttpException(
      "An open request for this product already exists",
      409,
    );
  }
  const supplyRequest = new SupplyRequest({
    product: supplyData.product,
    requestedAmount: supplyData.requestedAmount,
    requestedBy: currentUser._id,
    store: currentUser.store,
  });
  return await supplyRequest.save();
};

// il responsabile accoglie o respinge una richiesta in attesa (per respingerla serve il motivo).
// La richiesta resta nell'elenco: il dipendente vede l'esito, chi l'ha deciso e quando
const update = async (supplyId, { state, reason }, currentUser) => {
  const supplyRequest = await SupplyRequest.findById(supplyId);
  if (!supplyRequest) {
    throw new NotFoundException("Supply request not found");
  }
  // già accolta o respinta: la decisione non si cambia
  if (supplyRequest.state !== "open") {
    throw new HttpException("Supply request already handled", 400);
  }
  supplyRequest.state = state;
  supplyRequest.handledBy = currentUser._id;
  supplyRequest.handledAt = new Date();
  if (state === "rejected") supplyRequest.rejectReason = reason;
  return await supplyRequest.save();
};

// il dipendente annulla solo le sue richieste ancora in attesa
// (il responsabile non elimina: accoglie o respinge, così il dipendente sa com'è andata)
const deleteSupplyRequest = async (supplyId, currentUser) => {
  const supplyRequest = await SupplyRequest.findById(supplyId);
  if (
    !supplyRequest ||
    supplyRequest.requestedBy.toString() !== currentUser._id.toString()
  ) {
    throw new NotFoundException("Supply request not found");
  }
  if (supplyRequest.state !== "open") {
    throw new ForbiddenException("Handled requests cannot be deleted");
  }
  await supplyRequest.deleteOne();
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  deleteSupplyRequest,
};
