// import
const { body } = require("express-validator");

// regole per aprire la cassa: il fondo cassa, da 0 in su
const cashOpenRules = [
  body("openingFloat")
    .isFloat({ min: 0 })
    .withMessage("openingFloat must be a number from 0")
    .toFloat(),
];

module.exports = cashOpenRules;
