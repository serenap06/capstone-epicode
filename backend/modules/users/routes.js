// import
const express = require("express");
// router di /api/users
const usersRouter = express.Router();
const userController = require("./controller");

const validate = require("../../middlewares/validate/validate");
const authenticate = require("../../middlewares/auth/auth");
const authorizeRoles = require("../../middlewares/auth/authorizeRoles");
const { param } = require("express-validator");

const userBodyRules = require("../../middlewares/users/userBodyRules");
const userUpdateRules = require("../../middlewares/users/userUpdateRules");
const profileUpdateRules = require("../../middlewares/users/profileUpdateRules");
const passwordUpdateRules = require("../../middlewares/users/passwordUpdateRules");
const { uploadAvatar } = require("../../middlewares/upload/cloudinary");
const paginationRules = require("../../middlewares/globals/paginationRules");

// serve il login
usersRouter.use(authenticate);

// il mio profilo (tutti e due i ruoli)

usersRouter.get("/me", userController.findMe);
usersRouter.patch("/me", profileUpdateRules, validate, userController.updateMe);
usersRouter.patch(
  "/me/password",
  passwordUpdateRules,
  validate,
  userController.updateMyPassword,
);
usersRouter.patch(
  "/me/avatar",
  uploadAvatar.single("avatar"),
  userController.uploadAvatar,
);
usersRouter.delete("/me/avatar", userController.removeAvatar);

// gestione delle persone: da qui in giù solo il responsabile

usersRouter.use(authorizeRoles("admin"));

usersRouter.get("/", paginationRules, validate, userController.findAll);
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
