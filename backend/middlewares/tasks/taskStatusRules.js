// import
const { body } = require("express-validator");

// regole per cambiare lo stato di una task
const taskStatusRules = [
  body("status")
    .isIn(["pending", "done"])
    .withMessage("Status must be pending or done"),
];

module.exports = taskStatusRules;
