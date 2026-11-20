// import
const { query } = require("express-validator");

// regole della query delle casse: periodo (obbligatorio) e negozio
const cashQueryRules = [
  query("from").isISO8601().withMessage("from must be a valid date"),
  query("to").isISO8601().withMessage("to must be a valid date"),
  query("store").optional().isMongoId().withMessage("store must be a valid id"),
];

module.exports = cashQueryRules;
