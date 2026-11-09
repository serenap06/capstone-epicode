const { body } = require("express-validator");

const productBodyRules = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be at most 1000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active field must be a boolean property")
    .toBoolean(),
  body("brand")
    .optional()
    .isString()
    .withMessage("Brand must be a string")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Brand must be at most 255 characters"),
  body("category")
    .isString()
    .withMessage("Category must be a string")
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Category must be at most 255 characters"),
  body("vatRate")
    .optional()
    .isIn([4, 5, 10, 22])
    .withMessage("vatRate must be a 4, 5, 10 or 22"),
];

module.exports = productBodyRules;
