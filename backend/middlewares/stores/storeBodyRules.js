const { body } = require("express-validator");

const storeBodyRules = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be at most 255 characters"),
  body("address")
    .isString()
    .withMessage("Address must be a string")
    .notEmpty()
    .trim()
    .withMessage("Address field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("Address must be at most 255 characters"),
  body("city")
    .isString()
    .withMessage("City must be a string")
    .notEmpty()
    .trim()
    .withMessage("City field cannot be empty")
    .isLength({ min: 1, max: 255 })
    .withMessage("City must be at most 255 characters"),
];

module.exports = storeBodyRules;
