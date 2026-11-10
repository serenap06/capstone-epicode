const { query } = require("express-validator");

const saleQueryRules = [
  query("store").optional().isMongoId().withMessage("store must be a valid id"),
  query("soldBy")
    .optional()
    .isMongoId()
    .withMessage("soldBy must be a valid id"),
  query("from").optional().isISO8601().withMessage("from must be a valid date"),
  query("to").optional().isISO8601().withMessage("to must be a valid date"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be an integer greater than 0")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100")
    .toInt(),
];

module.exports = saleQueryRules;
