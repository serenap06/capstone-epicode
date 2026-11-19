// import
const HttpException = require("../index");

// 404: elemento non trovato
class NotFoundException extends HttpException {
  constructor(
    message = "Not Found",
    statusCode = 404,
    error = "The requested resource does not exist",
  ) {
    super(message, statusCode, error);
  }
}

module.exports = NotFoundException;
