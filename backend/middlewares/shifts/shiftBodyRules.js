const { body } = require("express-validator");
const shiftBodyRules = [
  body("user").isMongoId().withMessage("Invalid user Id"),
  body("store").isMongoId().withMessage("Invalid store Id"),
  body("startAt").isISO8601().withMessage("startAt must be a valid ISO date"),
  body("endAt").isISO8601().withMessage("endAt must be a valid ISO date"),
];

module.exports = shiftBodyRules;
