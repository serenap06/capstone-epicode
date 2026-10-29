const express = require("express");
const userController = require("./controller");
const validate = require("../../middlewares/validate/validate");
const userBodyRules = require("../../middlewares/users/userBodyRules");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");
const usersRouter = express.Router();

usersRouter.use(authenticate, authorizeRoles("admin"));

usersRouter.get("/", userController.findAll);
usersRouter.get(
  "/:userId",
  param("userId").isMongoId("Invalid user id"),
  validate,
  userController.findOne,
);

usersRouter.post("/", userBodyRules, validate, userController.create);

//usersRouter.patch("/:userId", userController.update);
//usersRouter.patch("/:userId/avatar", userController.uploadAvatar);

//usersRouter.delete("/:userId", userController.deleteUser);

module.exports = usersRouter;
