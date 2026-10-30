const express = require("express");
const userController = require("./controller");
const validate = require("../../middlewares/validate/validate");
const userBodyRules = require("../../middlewares/users/userBodyRules");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");
const usersRouter = express.Router();
const userUpdateRules = require("../../middlewares/users/userUpdateRules");

usersRouter.use(authenticate, authorizeRoles("admin"));

usersRouter.get("/", userController.findAll);

usersRouter.get(
  "/:userId",
  param("userId").isMongoId("Invalid user id"),
  validate,
  userController.findOne,
);

usersRouter.post("/", userBodyRules, validate, userController.create);

usersRouter.patch(
  "/:userId",
  param("userId").isMongoId("Invalid user id"),
  userUpdateRules,
  validate,
  userController.update,
);
//usersRouter.patch("/:userId/avatar", param("userId").isMongoId("Invalid user id"), validate, userController.uploadAvatar);

usersRouter.delete("/:userId", param("userId").isMongoId("Invalid user id"), validate, userController.deleteUser);

module.exports = usersRouter;
