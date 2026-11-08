const { query } = require("express-validator");

const shiftHoursQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store Id"),
  query("from").isISO8601().withMessage("from must be a valid ISO date"),
  query("to").isISO8601().withMessage("to must be a valid ISO date"),
];

module.exports = shiftHoursQueryRules;
