const { body } = require("express-validator");

const stockBodyRules = [
  body("product").isMongoId().withMessage("Invalid product Id"),
  body("store").isMongoId().withMessage("Invalid store Id"),
  body("amount")
    .isInt({ min: 0 })
    .withMessage("Amount must be an integer greater than or equal to 0")
    .toInt(),
  body("minThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("minThreshold must be an integer greater than or equal to 0")
    .toInt(),
];

module.exports = stockBodyRules;
