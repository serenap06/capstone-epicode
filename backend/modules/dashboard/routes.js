// import
const express = require("express");
// router di /api/dashboard
const dashboardRouter = express.Router();
const dashboardController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const dashboardQueryRules = require("../../middlewares/dashboard/dashboardQueryRules");

// serve il login
dashboardRouter.use(authenticate);

// numeri della Dashboard (solo il responsabile)
dashboardRouter.get(
  "/",
  authorizeRoles("admin"),
  dashboardQueryRules,
  validate,
  dashboardController.getKpis,
);

module.exports = dashboardRouter;
