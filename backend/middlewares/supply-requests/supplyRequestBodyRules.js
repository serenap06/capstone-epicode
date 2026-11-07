const { body } = require("express-validator");

const supplyRequestBodyRules = [
  body("product").isMongoId().withMessage("Invalid product id"),
  body("requestedAmount")
    .isInt({ min: 1 })
    .withMessage("Requested amount must be an integer gater than equal to 1")
    .toInt(),
];

module.exports = supplyRequestBodyRules;
