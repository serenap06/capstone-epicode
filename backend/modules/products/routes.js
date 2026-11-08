const express = require("express");
const productsRouter = express.Router();
const productController = require("./controller");

const authenticate = require("../../middlewares/auth/auth");
const authorizeRole = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const { param } = require("express-validator");
const {uploadProductImage}=require("../../middlewares/upload/cloudinary")

const productBodyRules = require("../../middlewares/products/productBodyRules");
const productUpdateRules = require("../../middlewares/products/productUpdateRules");
const productQueryRules = require("../../middlewares/products/productQueryRules");

productsRouter.use(authenticate);

productsRouter.get("/", productQueryRules, validate, productController.findAll);
productsRouter.get(
  "/:productId",
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  productController.findOne,
);

productsRouter.post(
  "/",
  authorizeRole("admin"),
  productBodyRules,
  validate,
  productController.create,
);

productsRouter.patch(
  "/:productId",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  productUpdateRules,
  validate,
  productController.update,
);

productsRouter.patch(
  "/:productId/image",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  uploadProductImage.single("image"),
  productController.updateImage,
);


productsRouter.delete(
  "/:productId",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  productController.deleteProduct,
);

module.exports = productsRouter;
