// import
const { body } = require("express-validator");

// regole per chiudere la cassa: imbustato, fondo di chiusura e totale del POS, da 0 in su
const cashCloseRules = [
  body("closingFloat")
    .isFloat({ min: 0 })
    .withMessage("closingFloat must be a number from 0")
    .toFloat(),
  body("envelopeAmount")
    .isFloat({ min: 0 })
    .withMessage("envelopeAmount must be a number from 0")
    .toFloat(),
  body("posAmount")
    .isFloat({ min: 0 })
    .withMessage("posAmount must be a number from 0")
    .toFloat(),
];

module.exports = cashCloseRules;
