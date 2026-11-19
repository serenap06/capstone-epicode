// import
const express = require("express");
// router di /api/shifts
const shiftsRouter = express.Router();
const shiftController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const shiftQueryRules = require("../../middlewares/shifts/shiftQueryRules");
const shiftBodyRules = require("../../middlewares/shifts/shiftBodyRules");
const shiftUpdateRules = require("../../middlewares/shifts/shiftUpdateRules");
const shiftHoursQueryRules = require("../../middlewares/shifts/shiftHoursQueryRules");

// serve il login
shiftsRouter.use(authenticate);

// elenco
shiftsRouter.get("/", shiftQueryRules, validate, shiftController.findAll);

// ore della settimana (prima di /:shiftId, se no "hours" sembrerebbe un id)
shiftsRouter.get(
  "/hours",
  authorizeRoles("admin", "employee"),
  shiftHoursQueryRules,
  validate,
  shiftController.findWeeklyHours,
);

// un turno
shiftsRouter.get(
  "/:shiftId",
  param("shiftId").isMongoId().withMessage("Invalid shift id"),
  validate,
  shiftController.findOne,
);

// nuovo, modifica ed elimina: solo il responsabile
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
