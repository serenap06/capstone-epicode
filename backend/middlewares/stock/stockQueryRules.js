const { query } = require("express-validator");
const paginationRules = require("../globals/paginationRules");

const stockQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
  query("product").optional().isMongoId().withMessage("Invalid product id"),
  query("lowStock")
    .optional()
    .isBoolean()
    .withMessage("lowStock must be boolean")
    .toBoolean(),
  query("search").optional().isString().trim(),
  query("sortBy")
    .optional()
    .isIn(["product", "store", "amount", "minThreshold", "status"])
    .withMessage(
      "sortBy must be product, store, amount, minThreshold or status",
    ),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),
  ...paginationRules,
];

module.exports = stockQueryRules;
