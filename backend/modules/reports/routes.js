const express = require("express");
const reportsRouter = express.Router();
const reportController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const reportQueryRules = require("../../middlewares/reports/reportQueryRules");

reportsRouter.use(authenticate, authorizeRoles("admin"));

reportsRouter.get(
  "/revenue",
  reportQueryRules,
  validate,
  reportController.findRevenue,
);

module.exports = reportsRouter;
