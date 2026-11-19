// import
const express = require("express");
// router di /api/supply-requests
const supplyRequestsRouter = express.Router();
const supplyRequestController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const supplyRequestBodyRules = require("../../middlewares/supply-requests/supplyRequestBodyRules");
const supplyRequestUpdateRules = require("../../middlewares/supply-requests/supplyRequestUpdateRules");
const supplyRequestQueryRules = require("../../middlewares/supply-requests/supplyRequestQueryRules");

// serve il login
supplyRequestsRouter.use(authenticate);

// elenco e una richiesta (il dipendente vede solo il suo negozio)
supplyRequestsRouter.get(
  "/",
  supplyRequestQueryRules,
  validate,
  supplyRequestController.findAll,
);
supplyRequestsRouter.get(
  "/:supplyId",
  param("supplyId").isMongoId().withMessage("Invalid supplyRequest Id"),
  validate,
  supplyRequestController.findOne,
);
// nuova richiesta (solo il dipendente)
supplyRequestsRouter.post(
  "/",
  authorizeRoles("employee"),
  supplyRequestBodyRules,
  validate,
  supplyRequestController.create,
);

// accogli o respingi (solo il responsabile)
supplyRequestsRouter.patch(
  "/:supplyId",
  authorizeRoles("admin"),
  param("supplyId").isMongoId().withMessage("Invalid supplyRequest Id"),
  supplyRequestUpdateRules,
  validate,
  supplyRequestController.update,
);

// annulla (solo il dipendente, le sue richieste in attesa)
supplyRequestsRouter.delete(
  "/:supplyId",
  authorizeRoles("employee"),
  param("supplyId").isMongoId().withMessage("Invalid supplyRequest Id"),
  validate,
  supplyRequestController.deleteSupplyRequest,
);

module.exports = supplyRequestsRouter;
