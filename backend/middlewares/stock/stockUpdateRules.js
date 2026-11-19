// import
const { body } = require("express-validator");

// regole per modificare una giacenza: quantità e soglia
const stockUpdateRules = [
  body("amount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Amount must be an integer greater than or equal to 0")
    .toInt(),
  body("minThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("minThreshold must be an integer greater than or equal to 0")
    .toInt(),
];

module.exports = stockUpdateRules;
