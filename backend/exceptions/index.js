// errore con il codice HTTP: lo lancio nei service e l'errorHandler lo trasforma in risposta
class HttpException extends Error {
  constructor(message, statusCode, error) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
  }
}

module.exports = HttpException;
