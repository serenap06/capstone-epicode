const Product = require("./schema");
const Stock = require("../stock/schema");
const SupplyRequest = require("../supply-requests/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const escapeRegex = require("../../utils/escapeRegex");
const buildPagination = require("../../utils/buildPagination");

// le colonne che si possono ordinare: il nome che arriva nella query → il campo del prodotto
const SORT_FIELDS = {
  name: "name",
  category: "category",
  price: "price",
  vatRate: "vatRate",
  state: "active",
};

// senza page restituisce tutti i prodotti dalla A alla Z (li usano la Cassa e i moduli);
// con page una pagina sola, nell'ordine scelto, più i totali e le categorie per il filtro
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

  // il dipendente vede solo i prodotti attivi
  const scope = currentUser.role === "employee" ? { active: true } : {};
  const query = { ...scope };
  // ricerca nel nome; "i": maiuscole e minuscole uguali
  if (search) query.name = { $regex: escapeRegex(search), $options: "i" };
  if (currentUser.role !== "employee" && active !== undefined) {
    query.active = active;
  }
  if (brand) query.brand = brand;
  if (category) query.category = category.toLowerCase();

  // senza page: tutti, come prima
  if (!page) {
    const products = await Product.find(query).sort({ name: 1 });
    return { products };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // ordine: 1 crescente, -1 decrescente. Per lo stato crescente vuol dire prima gli attivi
  // (active true), quindi giro la direzione. A parità di valore, dalla A alla Z
  const direction = order === "desc" ? -1 : 1;
  const sortStage = {
    [SORT_FIELDS[sortBy]]: sortBy === "state" ? -direction : direction,
  };
  if (sortBy !== "name") sortStage.name = 1;
  sortStage._id = 1;

  // cinque richieste insieme: la pagina, quanti prodotti passano i filtri (per le pagine),
  // quanti ce ne sono in tutto e quanti non attivi (sottotitolo), e le categorie (filtro)
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
      // distinct: ogni categoria una volta sola
      Product.distinct("category", scope),
    ]);

  return {
    products,
    totals: { count, inactiveCount },
    categories: categories.sort(),
    pagination: buildPagination(pageNumber, limitNumber, filteredCount),
  };
};

const findOne = async (productId, currentUser) => {
  const product = await Product.findById(productId);
  if (!product || (currentUser.role === "employee" && !product.active)) {
    throw new NotFoundException("Product not found");
  }
  return product;
};

const create = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const update = async (productId, productData) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  assignDefinedFields(product, productData);
  return await product.save();
};

const updateImage = async (productId, imageUrl) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  product.image = imageUrl;
  return await product.save();
};

// undefined toglie il campo image dal documento
const removeImage = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  product.image = undefined;
  return await product.save();
};

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
  // con il prodotto spariscono anche le sue giacenze e richieste (le due insieme)
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
