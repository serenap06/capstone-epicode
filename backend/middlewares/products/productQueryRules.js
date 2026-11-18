const { query } = require("express-validator");
const paginationRules = require("../globals/paginationRules");

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
  query("sortBy")
    .optional()
    .isIn(["name", "category", "price", "vatRate", "state"])
    .withMessage("sortBy must be name, category, price, vatRate or state"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),
  ...paginationRules,
];

module.exports = productQueryRules;
