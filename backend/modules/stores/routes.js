// import
const express = require("express");
// router di /api/stores
const storesRouter = express.Router();
const storeController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const storeBodyRules = require("../../middlewares/stores/storeBodyRules");
const storeUpdateRules = require("../../middlewares/stores/storeUpdateRules");

// login e solo il responsabile
storesRouter.use(authenticate, authorizeRoles("admin"));

// elenco e un negozio
storesRouter.get("/", storeController.findAll);

storesRouter.get(
  "/:storeId",
  param("storeId").isMongoId().withMessage("Invalid store id"),
  validate,
  storeController.findOne,
);

// nuovo, modifica ed elimina
storesRouter.post("/", storeBodyRules, validate, storeController.create);

storesRouter.patch(
  "/:storeId",
  param("storeId").isMongoId().withMessage("Invalid store id"),
  storeUpdateRules,
  validate,
  storeController.update,
);

storesRouter.delete(
  "/:storeId",
  param("storeId").isMongoId().withMessage("Invalid store id"),
  validate,

  storeController.deleteStore,
);

module.exports = storesRouter;
