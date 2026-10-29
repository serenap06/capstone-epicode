const HttpException = require("../index");

class InvalidCredentialException extends HttpException {
  constructor(
    message = "Invalid email or password",
    statusCode = 401,
    error = "The credentials are not correct",
  ) {
    super(message, statusCode, error);
  }
}

module.exports = InvalidCredentialException;
