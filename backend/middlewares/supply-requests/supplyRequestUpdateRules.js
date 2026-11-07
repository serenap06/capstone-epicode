const { body } = require("express-validator");

const supplyRequestUpdateRules = [
  body("state")
    .isIn(["open", "handled"])
    .withMessage("State must be open or handled"),
];

module.exports = supplyRequestUpdateRules;
