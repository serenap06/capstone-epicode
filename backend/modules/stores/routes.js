const express = require("express");
const storesRouter = express.Router();
const storeController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const storeBodyRules = require("../../middlewares/stores/storeBodyRules");
const storeUpdateRules = require("../../middlewares/stores/storeUpdateRules");

storesRouter.use(authenticate);

storesRouter.get("/", storeController.findAll);

storesRouter.get(
  "/:storeId",
  param("storeId").isMongoId().withMessage("Invalid store id"),
  validate,
  storeController.findOne,
);

storesRouter.post(
  "/",
  authorizeRoles("admin"),
  storeBodyRules,
  validate,
  storeController.create,
);

storesRouter.patch(
  "/:storeId",
  authorizeRoles("admin"),
  param("storeId").isMongoId().withMessage("Invalid store id"),
  storeUpdateRules,
  validate,
  storeController.update,
);

storesRouter.delete(
  "/:storeId",
  authorizeRoles("admin"),
  param("storeId").isMongoId().withMessage("Invalid store id"),
  validate,

  storeController.deleteStore,
);

module.exports = storesRouter;
