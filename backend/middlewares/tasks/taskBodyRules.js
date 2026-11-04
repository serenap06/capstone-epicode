const { body } = require("express-validator");

const taskBodyRules = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Title must be at most 255 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must be at most 255 characters"),
  body("dueDate").isISO8601().withMessage("dueDate must be a valid ISO date"),
  body("priority")
    .optional()
    .isIn(["high", "medium", "low"])
    .withMessage("Invalid task priority"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be boolean")
    .toBoolean(),
  body("assignedTo")
    .if((value, { req }) => !req.body.isGlobal)
    .isMongoId()
    .withMessage("assignedTo is required and must be a valid user id"),
  body("category")
    .optional()
    .isIn(["operations", "administrative"])
    .withMessage("Invalid task category"),
  body("type")
    .optional()
    .isIn(["daily", "monthly"])
    .withMessage("Invalid task type"),
  body("store").isMongoId().withMessage("Invalid store id"),
];

module.exports = taskBodyRules;
