const { body } = require("express-validator");

const userBodyRules = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be at most 255 characters"),
  body("surname")
    .isString()
    .withMessage("Surname must be a string")
    .notEmpty()
    .withMessage("Surname field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Surname must be at most 255 characters"),
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(["admin", "employee"])
    .withMessage("Role must be admin or employee"),
  body("store").optional().isMongoId().withMessage("Store must be a valid id"),
];

module.exports = userBodyRules;
