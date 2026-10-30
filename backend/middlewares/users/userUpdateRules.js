const { body } = require("express-validator");

const userUpdateRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 255 }),
  body("surname")
    .optional()
    .isString()
    .withMessage("Surname must be a string")
    .notEmpty()
    .isLength({ min: 1, max: 255 })
    .withMessage("Surname field cannot be empty"),
  body("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("role")
    .optional()
    .isIn(["admin", "employee"])
    .withMessage("Role must be admin or employee"),
  body("store")
    .optional()
    .isMongoId()
    .withMessage("Store must be a valid id"),
];

module.exports = userUpdateRules;
