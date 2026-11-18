const express = require("express");
const supplyRequestsRouter = express.Router();
const supplyRequestController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const supplyRequestBodyRules = require("../../middlewares/supply-requests/supplyRequestBodyRules");
const supplyRequestUpdateRules = require("../../middlewares/supply-requests/supplyRequestUpdateRules");
const supplyRequestQueryRules = require("../../middlewares/supply-requests/supplyRequestQueryRules");

supplyRequestsRouter.use(authenticate);

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
supplyRequestsRouter.post(
  "/",
  authorizeRoles("employee"),
  supplyRequestBodyRules,
  validate,
  supplyRequestController.create,
);

supplyRequestsRouter.patch(
  "/:supplyId",
  authorizeRoles("admin"),
  param("supplyId").isMongoId().withMessage("Invalid supplyRequest Id"),
  supplyRequestUpdateRules,
  validate,
  supplyRequestController.update,
);

// eliminare (annullare) una richiesta: solo il dipendente, le sue in attesa
supplyRequestsRouter.delete(
  "/:supplyId",
  authorizeRoles("employee"),
  param("supplyId").isMongoId().withMessage("Invalid supplyRequest Id"),
  validate,
  supplyRequestController.deleteSupplyRequest,
);

module.exports = supplyRequestsRouter;
