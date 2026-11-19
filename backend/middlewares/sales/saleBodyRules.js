// import
const { body } = require("express-validator");

// regole per registrare una vendita
const saleBodyRules = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("items must be a non-empty array"),
  // lo stesso prodotto una volta sola
  body("items")
    .custom(
      (items) =>
        new Set(items.map((item) => item.product)).size === items.length,
    )
    .withMessage("Each product can appear only once"),
  body("items.*.product").isMongoId().withMessage("product must be a valid id"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("quantity must be an integer greater than 0")
    .toInt(),
  body("paymentMethod")
    .isIn(["cash", "card"])
    .withMessage("paymentMethod must be cash or card"),
];

module.exports = saleBodyRules;
