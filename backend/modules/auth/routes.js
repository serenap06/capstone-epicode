// import
const express = require("express");
const authController = require("./controller");
const authenticate = require("../../middlewares/auth/auth");
const loginRules = require("../../middlewares/auth/loginRules");
const validate = require("../../middlewares/validate/validate");

// router di /api/auth
const authRouter = express.Router();

// utente collegato e login (il login è l'unica rotta senza token)
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/login", loginRules, validate, authController.login);

module.exports = authRouter;
