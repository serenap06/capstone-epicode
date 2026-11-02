const { body } = require("express-validator");

const storeUpdateRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be at most 255 characters"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .trim()
    .notEmpty()
    .withMessage("Address field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Address must be at most 255 characters"),
  body("city")
    .optional()
    .isString()
    .withMessage("City must be a string")
    .trim()
    .notEmpty()
    .withMessage("City field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("City must be at most 255 characters"),
];

module.exports = storeUpdateRules;
