// import
const { body } = require("express-validator");

// regole per cambiare password: quella attuale e la nuova (almeno 8 caratteri)
const passwordUpdateRules = [
  body("currentPassword")
    .isString()
    .withMessage("Current password must be a string")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isString()
    .withMessage("New password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

module.exports = passwordUpdateRules;
