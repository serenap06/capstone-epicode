const express = require("express");
const salesRouter = express.Router();
const saleController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const saleBodyRules = require("../../middlewares/sales/saleBodyRules");
const saleQueryRules = require("../../middlewares/sales/saleQueryRules");
const saleCancelRules = require("../../middlewares/sales/saleCancelRules");

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

salesRouter.patch(
  "/:saleId/cancel",
  authorizeRoles("employee"),
  saleCancelRules,
  validate,
  saleController.cancel,
);

module.exports = salesRouter;
