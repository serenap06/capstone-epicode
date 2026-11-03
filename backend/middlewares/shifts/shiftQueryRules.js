const { query } = require("express-validator");

const shiftQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store Id"),
  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be a valid ISO date"),
  query("to").optional().isISO8601().withMessage("to must be a valid ISO date"),
];

module.exports = shiftQueryRules;
