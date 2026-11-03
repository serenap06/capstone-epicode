const { body } = require("express-validator");
const shiftUpdateRules = [
  body("user").optional().isMongoId().withMessage("Invalid user Id"),
  body("store").optional().isMongoId().withMessage("Invalid store Id"),
  body("startAt")
    .optional()
    .isISO8601()
    .withMessage("startAt must be a valid ISO date"),
  body("endAt")
    .optional()
    .isISO8601()
    .withMessage("endAt must be a valid ISO date"),
];

module.exports = shiftUpdateRules;
