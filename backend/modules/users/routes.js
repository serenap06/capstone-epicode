const express = require("express");
const usersRouter = express.Router();
const userController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const userBodyRules = require("../../middlewares/users/userBodyRules");
const userUpdateRules = require("../../middlewares/users/userUpdateRules");
const profileUpdateRules = require("../../middlewares/users/profileUpdateRules");
const { uploadAvatar } = require("../../middlewares/upload/cloudinary");

usersRouter.use(authenticate);

// Rotte per l'employee

usersRouter.get("/me", userController.findMe);
usersRouter.patch("/me", profileUpdateRules, validate, userController.updateMe);
usersRouter.patch(
  "/me/avatar",
  uploadAvatar.single("avatar"),
  userController.uploadAvatar,
);

// Rotte per l'admin

usersRouter.use(authorizeRoles("admin"));

usersRouter.get("/", userController.findAll);
usersRouter.get(
  "/:userId",
  param("userId").isMongoId().withMessage("Invalid user id"),
  validate,
  userController.findOne,
);

usersRouter.post("/", userBodyRules, validate, userController.create);

usersRouter.patch(
  "/:userId",
  param("userId").isMongoId().withMessage("Invalid user id"),
  userUpdateRules,
  validate,
  userController.update,
);

usersRouter.delete(
  "/:userId",
  param("userId").isMongoId().withMessage("Invalid user id"),
  validate,
  userController.deleteUser,
);

module.exports = usersRouter;
