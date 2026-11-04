const { query } = require("express-validator");

const stockQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
  query("product").optional().isMongoId().withMessage("Invalid product id"),
  query("lowStock")
    .optional()
    .isBoolean()
    .withMessage("lowStock must be boolean")
    .toBoolean(),
];

module.exports = stockQueryRules;
