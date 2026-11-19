// import
const express = require("express");
// router di /api/sales
const salesRouter = express.Router();
const saleController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const saleBodyRules = require("../../middlewares/sales/saleBodyRules");
const saleQueryRules = require("../../middlewares/sales/saleQueryRules");
const saleCancelRules = require("../../middlewares/sales/saleCancelRules");

// serve il login
salesRouter.use(authenticate);

// elenco (tutti e due i ruoli)
salesRouter.get(
  "/",
  authorizeRoles("admin", "employee"),
  saleQueryRules,
  validate,
  saleController.findAll,
);

// nuova vendita (solo il dipendente)
salesRouter.post(
  "/",
  authorizeRoles("employee"),
  saleBodyRules,
  validate,
  saleController.create,
);

// annullamento (solo il dipendente)
salesRouter.patch(
  "/:saleId/cancel",
  authorizeRoles("employee"),
  saleCancelRules,
  validate,
  saleController.cancel,
);

module.exports = salesRouter;
