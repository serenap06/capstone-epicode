// import
const { body } = require("express-validator");

// regole per modificare il proprio profilo: tutti i campi facoltativi
const profileUpdateRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("surname")
    .optional()
    .isString()
    .withMessage("Surname must be a string")
    .trim()
    .notEmpty()
    .withMessage("Surname cannot be empty"),
  // minuscole come alla creazione (normalizeEmail toglierebbe i punti delle gmail)
  body("email")
    .optional()
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Email must be a valid email"),
];
module.exports = profileUpdateRules;
