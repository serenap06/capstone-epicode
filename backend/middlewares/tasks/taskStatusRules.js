const { body } = require("express-validator");

const taskStatusRules = [
  body("status")
    .isIn(["pending", "done"])
    .withMessage("Status must be pending or done"),
];

module.exports = taskStatusRules;
