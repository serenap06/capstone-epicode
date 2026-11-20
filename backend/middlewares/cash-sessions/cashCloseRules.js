// import
const { body } = require("express-validator");

// regole per chiudere la cassa: imbustato e fondo di chiusura, da 0 in su
const cashCloseRules = [
  body("closingFloat")
    .isFloat({ min: 0 })
    .withMessage("closingFloat must be a number from 0")
    .toFloat(),
  body("envelopeAmount")
    .isFloat({ min: 0 })
    .withMessage("envelopeAmount must be a number from 0")
    .toFloat(),
];

module.exports = cashCloseRules;
