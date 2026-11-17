const Product = require("./schema");
const Stock = require("../stock/schema");
const SupplyRequest = require("../supply-requests/schema");

const NotFoundException = require("../../exceptions/auth/NotFoundException");
const assignDefinedFields = require("../../utils/assignDefinedFields");
const escapeRegex = require("../../utils/escapeRegex");

const findAll = async (filters, currentUser) => {
  const { search, active, brand, category } = filters;

  const query = {};
  // ricerca nel nome; "i": maiuscole e minuscole uguali
  if (search) query.name = { $regex: escapeRegex(search), $options: "i" };
  // il dipendente vede solo i prodotti attivi
  if (currentUser.role === "employee") {
    query.active = true;
  } else if (active !== undefined) {
    query.active = active;
  }
  if (brand) query.brand = brand;
  if (category) query.category = category.toLowerCase();

  return await Product.find(query).sort({ name: 1 });
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
