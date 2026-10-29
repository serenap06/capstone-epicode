const HttpException = require("../index");

class ForbiddenException extends HttpException {
  constructor(
    message = "Forbidden",
    statusCode = 403,
    error = " You do not have permission to access this resource",
  ) {
    super(message, statusCode, error);
  }
}

module.exports = ForbiddenException;
