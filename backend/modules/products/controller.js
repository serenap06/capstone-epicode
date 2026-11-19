// import
const HttpException = require("../../exceptions");
const productService = require("./service");

// GET /api/products: il catalogo (a pagine se arriva page)
const findAll = async (req, res, next) => {
  try {
    const { search, active, brand, category, sortBy, order, page, limit } =
      req.query;
    const result = await productService.findAll(
      {
        search,
        active,
        brand,
        category,
        sortBy,
        order,
        page,
        limit,
      },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      products: result.products,
      totals: result.totals,
      categories: result.categories,
      pagination: result.pagination,
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/products/:productId: un prodotto
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

// POST /api/products: nuovo prodotto (solo il responsabile)
const create = async (req, res, next) => {
  try {
    const { name, description, price, active, brand, category, vatRate } =
      req.body;
    const product = await productService.create({
      name,
      description,
      price,
      active,
      brand,
      category,
      vatRate,
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

// PATCH /api/products/:productId: modifico i dati, la foto no
const update = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, active, brand, category, vatRate } =
      req.body;
    const product = await productService.update(productId, {
      name,
      description,
      price,
      active,
      brand,
      category,
      vatRate,
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

// PATCH /api/products/:productId/image: carico la foto (multer + Cloudinary)
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

// DELETE /api/products/:productId/image: tolgo la foto
const removeImage = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productService.removeImage(productId);
    res.status(200).send({
      statusCode: 200,
      message: "Product image removed successfully",
      product,
    });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/products/:productId: elimino il prodotto
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
  removeImage,
  deleteProduct,
};
