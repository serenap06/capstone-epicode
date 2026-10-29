const { validationResult } = require("express-validator");
const HttpException = require("../../exceptions/index");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpException("Validation failed", 400, errors.array()));
  }
  next();
};

module.exports = validate;
