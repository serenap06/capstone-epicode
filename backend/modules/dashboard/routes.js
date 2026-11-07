const express = require("express");
const dashboardRouter = express.Router();
const dashboardController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const dashboardQueryRules = require("../../middlewares/dashboard/dashboardQueryRules");

dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/",
  authorizeRoles("admin"),
  dashboardQueryRules,
  validate,
  dashboardController.getKpis,
);

module.exports = dashboardRouter;
