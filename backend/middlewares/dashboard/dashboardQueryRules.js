const { query } = require("express-validator");

const dashboardQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
];

module.exports = dashboardQueryRules
