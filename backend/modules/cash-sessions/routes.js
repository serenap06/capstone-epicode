// import
const express = require("express");
// router di /api/cash-sessions
const cashSessionsRouter = express.Router();
const cashSessionController = require("./controller");

const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");

const cashOpenRules = require("../../middlewares/cash-sessions/cashOpenRules");
const cashCloseRules = require("../../middlewares/cash-sessions/cashCloseRules");
const cashQueryRules = require("../../middlewares/cash-sessions/cashQueryRules");

// serve il login
cashSessionsRouter.use(authenticate);

// la cassa di oggi (solo il dipendente)
cashSessionsRouter.get(
  "/today",
  authorizeRoles("employee"),
  cashSessionController.findToday,
);

// casse di un periodo (tutti e due i ruoli; il dipendente solo il suo negozio)
cashSessionsRouter.get(
  "/",
  authorizeRoles("admin", "employee"),
  cashQueryRules,
  validate,
  cashSessionController.findAll,
);

// apertura con il fondo cassa (solo il dipendente)
cashSessionsRouter.post(
  "/open",
  authorizeRoles("employee"),
  cashOpenRules,
  validate,
  cashSessionController.open,
);

// chiusura con imbustato e fondo di chiusura (solo il dipendente)
cashSessionsRouter.patch(
  "/close",
  authorizeRoles("employee"),
  cashCloseRules,
  validate,
  cashSessionController.close,
);

module.exports = cashSessionsRouter;
