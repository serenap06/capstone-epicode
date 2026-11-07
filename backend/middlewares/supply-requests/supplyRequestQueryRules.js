const { query } = require("express-validator");

const supplyRequestQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
  query("product").optional().isMongoId().withMessage("Invalid product id"),
  query("state")
    .optional()
    .isIn(["open", "handled"])
    .withMessage("State must be open or handled"),
];

module.exports = supplyRequestQueryRules;
