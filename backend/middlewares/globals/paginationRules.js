const { query } = require("express-validator");

// page e limit, uguali per tutti gli elenchi divisi in pagine
const paginationRules = [
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

module.exports = paginationRules;
