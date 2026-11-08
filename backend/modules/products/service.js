const Product = require("./schema");
const NotFoundException = require("../../exceptions/auth/NotFoundException");

const findAll = async (filters, currentUser) => {
  const { search, active, brand, category } = filters;

  const query = {};
  if (search) query.name = { $regex: search, $options: "i" };
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
  Object.entries(productData).forEach(([field, value]) => {
    if (value !== undefined) {
      product[field] = value;
    }
  });
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

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new NotFoundException("Product not found");
  }
};

module.exports = {
  findAll,
  findOne,
  create,
  update,
  updateImage,
  deleteProduct,
};
