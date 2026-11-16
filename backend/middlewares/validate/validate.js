const { validationResult } = require("express-validator");
const HttpException = require("../../exceptions/index");

// va messo dopo le regole di express-validator: se una regola non è rispettata
// risponde 400 con l'elenco degli errori, altrimenti passa al controller
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpException("Validation failed", 400, errors.array()));
  }
  next();
};

module.exports = validate;
