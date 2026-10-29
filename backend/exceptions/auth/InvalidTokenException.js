const HttpException = require("../index");

class InvalidTokenException extends HttpException {
  constructor(
    message = "Invalid or missing token",
    statusCode = 401,
    error = "The token provided is expired or invalid",
  ) {
    super(message, statusCode, error);
  }
}
module.exports = InvalidTokenException;
