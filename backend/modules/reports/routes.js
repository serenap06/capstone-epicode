// import
const express = require("express");
// router di /api/reports
const reportsRouter = express.Router();
const reportController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const reportQueryRules = require("../../middlewares/reports/reportQueryRules");

// login e solo il responsabile
reportsRouter.use(authenticate, authorizeRoles("admin"));

// incassi del periodo
reportsRouter.get(
  "/revenue",
  reportQueryRules,
  validate,
  reportController.findRevenue,
);

module.exports = reportsRouter;
