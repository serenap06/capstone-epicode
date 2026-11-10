const { query } = require("express-validator");

const reportQueryRules = [
  query("from").isISO8601().withMessage("from must be a valid date"),
  query("to").isISO8601().withMessage("to must be a valid date"),
  query("groupBy")
    .optional()
    .isIn(["day", "week", "month"])
    .withMessage("groupBy must be day, week or month"),
  query("store").optional().isMongoId().withMessage("store must be a valid id"),
];

module.exports = reportQueryRules;
