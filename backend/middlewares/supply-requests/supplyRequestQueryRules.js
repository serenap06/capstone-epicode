// import
const { query } = require("express-validator");
const paginationRules = require("../globals/paginationRules");

// regole della query delle Forniture: filtri, ordine e pagine
const supplyRequestQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
  query("product").optional().isMongoId().withMessage("Invalid product id"),
  query("state")
    .optional()
    .isIn(["open", "handled", "rejected"])
    .withMessage("State must be open, handled or rejected"),
  query("search").optional().isString().trim(),
  query("sortBy")
    .optional()
    .isIn(["product", "store", "amount", "requestedBy", "date", "state"])
    .withMessage(
      "sortBy must be product, store, amount, requestedBy, date or state",
    ),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be asc or desc"),
  ...paginationRules,
];

module.exports = supplyRequestQueryRules;
