const HttpException = require("../../exceptions");
const productService = require("./service");

const findAll = async (req, res, next) => {
  try {
    const { search, active, brand, category } = req.query;
    const products = await productService.findAll(
      {
        search,
        active,
        brand,
        category,
      },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      products,
    });
  } catch (e) {
    next(e);
  }
};

const findOne = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productService.findOne(productId, req.user);
    res.status(200).send({
      statusCode: 200,
      product,
    });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, price, active, brand, category } = req.body;
    const product = await productService.create({
      name,
      description,
      price,
      active,
      brand,
      category,
    });
    res.status(201).send({
      statusCode: 201,
      message: "Product created successfully",
      product,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, active, brand, category } = req.body;
    const product = await productService.update(productId, {
      name,
      description,
      price,
      active,
      brand,
      category,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Product updated successfully",
      product,
    });
  } catch (e) {
    next(e);
  }
};

const updateImage = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!req.file) {
      throw new HttpException("Image file is required", 400);
    }
    const product = await productService.updateImage(productId, req.file.path);
    res.status(200).send({
      statusCode: 200,
      message: "Product image updated successfully",
      product,
    });
  } catch (e) {
    next(e);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await productService.deleteProduct(productId);
    res.status(200).send({
      statusCode: 200,
      message: "Product deleted successfully",
    });
  } catch (e) {
    next(e);
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
