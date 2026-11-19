// import
const express = require("express");
// router di /api/products
const productsRouter = express.Router();
const productController = require("./controller");

const authenticate = require("../../middlewares/auth/auth");
const authorizeRole = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const { param } = require("express-validator");
const { uploadProductImage } = require("../../middlewares/upload/cloudinary");

const productBodyRules = require("../../middlewares/products/productBodyRules");
const productUpdateRules = require("../../middlewares/products/productUpdateRules");
const productQueryRules = require("../../middlewares/products/productQueryRules");

// serve il login per tutte le rotte
productsRouter.use(authenticate);

// elenco e un prodotto (tutti; il dipendente vede solo gli attivi)
productsRouter.get("/", productQueryRules, validate, productController.findAll);
productsRouter.get(
  "/:productId",
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  productController.findOne,
);

// nuovo (solo il responsabile)
productsRouter.post(
  "/",
  authorizeRole("admin"),
  productBodyRules,
  validate,
  productController.create,
);

// modifica
productsRouter.patch(
  "/:productId",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  productUpdateRules,
  validate,
  productController.update,
);

// foto: multer la carica su Cloudinary
productsRouter.patch(
  "/:productId/image",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  uploadProductImage.single("image"),
  productController.updateImage,
);

// tolgo la foto (nell'app torna l'iniziale)
productsRouter.delete(
  "/:productId/image",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  productController.removeImage,
);

// elimina
productsRouter.delete(
  "/:productId",
  authorizeRole("admin"),
  param("productId").isMongoId().withMessage("Invalid product id"),
  validate,
  productController.deleteProduct,
);

module.exports = productsRouter;
