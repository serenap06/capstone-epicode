// import
const { body } = require("express-validator");

// regole del login: email valida e password non vuota
const loginRules = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = loginRules;
