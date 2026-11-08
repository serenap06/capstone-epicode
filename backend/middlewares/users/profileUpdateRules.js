const { body } = require("express-validator");

const profileUpdateRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("surname")
    .optional()
    .isString()
    .withMessage("Surname must be a string")
    .trim()
    .notEmpty()
    .withMessage("Surname cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email")
    .normalizeEmail(),
];
module.exports = profileUpdateRules;
