const { body, param } = require("express-validator");

const saleCancelRules = [
  param("saleId").isMongoId().withMessage("Invalid sale id"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("reason is required")
    .isLength({ max: 200 })
    .withMessage("reason must be at most 200 characters"),
];
module.exports = saleCancelRules;
