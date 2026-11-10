const express = require("express");
const salesRouter = express.Router();
const saleController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const saleBodyRules = require("../../middlewares/sales/saleBodyRules");
const saleQueryRules = require("../../middlewares/sales/saleQueryRules");

salesRouter.use(authenticate);

salesRouter.get(
  "/",
  authorizeRoles("admin", "employee"),
  saleQueryRules,
  validate,
  saleController.findAll,
);

salesRouter.post(
  "/",
  authorizeRoles("employee"),
  saleBodyRules,
  validate,
  saleController.create,
);

module.exports = salesRouter;
