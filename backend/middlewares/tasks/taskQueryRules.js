const { query } = require("express-validator");

const taskQueryRules = [
  query("store").optional().isMongoId().withMessage("Invalid store id"),
  query("assignedTo").optional().isMongoId().withMessage("Invalid user id"),
  query("status")
    .optional()
    .isIn(["pending", "done"])
    .withMessage("Invalid task status"),
  query("category")
    .optional()
    .isIn(["operations", "administrative"])
    .withMessage("Invalid task category"),
  query("type")
    .optional()
    .isIn(["daily", "monthly"])
    .withMessage("Invalid task type"),
  query("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be boolean")
    .toBoolean(),
  query("from")
    .optional()
    .isISO8601()
    .withMessage("from must be a valid ISO date"),
  query("to").optional().isISO8601().withMessage("to must be a valid ISO date"),
];

module.exports = taskQueryRules;
