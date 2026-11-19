// import
const Product = require("./schema");
const Stock = require("../stock/schema");
const SupplyRequest = require("../supply-requests/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const escapeRegex = require("../../utils/escapeRegex");
const buildPagination = require("../../utils/buildPagination");

// colonne ordinabili: nome nella query → campo del prodotto
const SORT_FIELDS = {
  name: "name",
  category: "category",
  price: "price",
  vatRate: "vatRate",
  state: "active",
};

// senza page tutti i prodotti A→Z (Cassa e moduli); con page una pagina, totali e categorie
const findAll = async (filters, currentUser) => {
  const {
    search,
    active,
    brand,
    category,
    sortBy = "name",
    order = "asc",
    page,
    limit = 10,
  } = filters;

  // il dipendente vede solo gli attivi
  const scope = currentUser.role === "employee" ? { active: true } : {};
  const query = { ...scope };
  // ricerca nel nome, senza badare alle maiuscole ("i")
  if (search) query.name = { $regex: escapeRegex(search), $options: "i" };
  if (currentUser.role !== "employee" && active !== undefined) {
    query.active = active;
  }
  if (brand) query.brand = brand;
  if (category) query.category = category.toLowerCase();

  // senza page: tutti
  if (!page) {
    const products = await Product.find(query).sort({ name: 1 });
    return { products };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // ordine: 1 crescente, -1 decrescente; per lo stato giro la direzione (prima gli attivi).
  // A parità, dalla A alla Z
  const direction = order === "desc" ? -1 : 1;
  const sortStage = {
    [SORT_FIELDS[sortBy]]: sortBy === "state" ? -direction : direction,
  };
  if (sortBy !== "name") sortStage.name = 1;
  sortStage._id = 1;

  // cinque richieste insieme: pagina, quanti passano i filtri, totale, non attivi e categorie
  const [products, filteredCount, count, inactiveCount, categories] =
    await Promise.all([
      Product.find(query)
        .sort(sortStage)
        .collation({ locale: "it" })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Product.countDocuments(query),
      Product.countDocuments(scope),
      Product.countDocuments({ ...scope, active: false }),
      // ogni categoria una volta sola
      Product.distinct("category", scope),
    ]);

  return {
    products,
    totals: { count, inactiveCount },
    categories: categories.sort(),
    pagination: buildPagination(pageNumber, limitNumber, filteredCount),
  };
};

// un prodotto (il dipendente non vede quelli non attivi)
const findOne = async (productId, currentUser) => {
  const product = await Product.findById(productId);
  if (!product || (currentUser.role === "employee" && !product.active)) {
    throw new NotFoundException("Product not found");
  }
  return product;
};

// nuovo prodotto
const create = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

// modifico il prodotto con i campi arrivati
const update = async (productId, productData) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  assignDefinedFields(product, productData);
  return await product.save();
};

// salvo il link della foto
const updateImage = async (productId, imageUrl) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  product.image = imageUrl;
  return await product.save();
};

// tolgo la foto (undefined toglie il campo)
const removeImage = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  product.image = undefined;
  return await product.save();
};

// elimino il prodotto
const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  // con lui spariscono le sue giacenze e richieste
  await Promise.all([
    Stock.deleteMany({ product: productId }),
    SupplyRequest.deleteMany({ product: productId }),
  ]);
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  updateImage,
  removeImage,
  deleteProduct,
};
