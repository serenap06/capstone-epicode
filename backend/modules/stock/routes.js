const express = require("express");
const stockRouter = express.Router();
const stockController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const stockBodyRules = require("../../middlewares/stock/stockBodyRules");
const stockUpdateRules = require("../../middlewares/stock/stockUpdateRules");
const stockQueryRules = require("../../middlewares/stock/stockQueryRules");

stockRouter.use(authenticate);

stockRouter.get("/", stockQueryRules, validate, stockController.findAll);
stockRouter.get(
  "/:stockId",
  param("stockId").isMongoId().withMessage("Invalid stock id"),
  validate,
  stockController.findOne,
);

stockRouter.post(
  "/",
  authorizeRoles("admin"),
  stockBodyRules,
  validate,
  stockController.create,
);

stockRouter.patch(
  "/:stockId",
  authorizeRoles("admin"),
  param("stockId").isMongoId().withMessage("Invalid stock id"),
  stockUpdateRules,
  validate,
  stockController.update,
);

stockRouter.delete(
  "/:stockId",
  authorizeRoles("admin"),
  param("stockId").isMongoId().withMessage("Invalid stock id"),
  validate,
  stockController.deleteStock,
);

module.exports = stockRouter;
