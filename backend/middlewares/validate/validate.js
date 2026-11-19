// import
const { validationResult } = require("express-validator");
const HttpException = require("../../exceptions/index");

// dopo le regole: se qualcosa non va rispondo 400 con gli errori, altrimenti avanti
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpException("Validation failed", 400, errors.array()));
  }
  next();
};

module.exports = validate;
