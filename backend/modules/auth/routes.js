const express = require("express");
const authController = require("./controller");
const authenticate = require("../../middlewares/auth/auth");
const loginRules = require("../../middlewares/auth/loginRules");
const validate = require("../../middlewares/validate/validate");

const authRouter = express.Router();

authRouter.get("/me", authenticate, authController.me);
authRouter.post("/login", loginRules, validate, authController.login);

module.exports = authRouter;
