const { body } = require("express-validator");

const taskUpdateRules = [
  body("title")
    .optional()
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
  body("dueDate").optional().isISO8601().withMessage("dueDate must be a valid ISO date"),
  body("priority")
    .optional()
    .isIn(["high", "medium", "low"])
    .withMessage("Invalid task priority"),
  body("category")
    .optional()
    .isIn(["operations", "administrative"])
    .withMessage("Invalid task category"),
  body("type")
    .optional()
    .isIn(["daily", "monthly"])
    .withMessage("Invalid task type"),
];

module.exports = taskUpdateRules;
