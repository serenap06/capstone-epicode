const { query } = require("express-validator");

const productQueryRules = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .trim(),
  query("active")
    .optional()
    .isBoolean()
    .withMessage("Active field must be a boolean property")
    .toBoolean(),
  query("brand")
    .optional()
    .isString()
    .withMessage("Brand must be a string")
    .trim(),
  query("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
];

module.exports = productQueryRules;
