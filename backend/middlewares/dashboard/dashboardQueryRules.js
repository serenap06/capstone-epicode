// import
const { query } = require("express-validator");

// regole della query della Dashboard: negozio facoltativo
const dashboardQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
];

module.exports = dashboardQueryRules;
