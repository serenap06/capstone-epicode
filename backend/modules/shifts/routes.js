const express = require("express");
const shiftsRouter = express.Router();
const shiftController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const shiftQueryRules = require("../../middlewares/shifts/shiftQueryRules");
const shiftBodyRules = require("../../middlewares/shifts/shiftBodyRules");
const shiftUpdateRules = require("../../middlewares/shifts/shiftUpdateRules");

shiftsRouter.use(authenticate);

shiftsRouter.get("/", shiftQueryRules, validate, shiftController.findAll);

shiftsRouter.get(
  "/:shiftId",
  param("shiftId").isMongoId().withMessage("Invalid shift id"),
  validate,
  shiftController.findOne,
);

shiftsRouter.post(
  "/",
  authorizeRoles("admin"),
  shiftBodyRules,
  validate,
  shiftController.create,
);

shiftsRouter.patch(
  "/:shiftId",
  authorizeRoles("admin"),
  param("shiftId").isMongoId().withMessage("Invalid shift id"),
  shiftUpdateRules,
  validate,
  shiftController.update,
);

shiftsRouter.delete(
  "/:shiftId",
  authorizeRoles("admin"),
  param("shiftId").isMongoId().withMessage("Invalid shift id"),
  validate,
  shiftController.deleteShift,
);

module.exports = shiftsRouter;
