const mongoose = require("mongoose");
const HttpException = require("../../exceptions");
const multer = require("multer");

// ultimo middleware: riceve ogni errore passato con next(e) e risponde sempre
// con la stessa forma { statusCode, message, error }
const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).send({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
  }
  // file troppo grande o campo sbagliato nell'upload
  if (err instanceof multer.MulterError) {
    return res.status(400).send({
      statusCode: 400,
      message: "Upload error",
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large: maximum size is 2 MB"
          : err.message,
    });
  }
  // Cloudinary rifiuta il formato del file
  if (err.http_code === 400) {
    return res.status(400).send({
      statusCode: 400,
      message: "Upload error",
      error: "File format not allowed: use png, jpg, jpeg or webp",
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).send({
      statusCode: 400,
      message: "Mongoose Error: object id invalid or malformed",
      error: err.message,
    });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).send({
      statusCode: 400,
      message: "Mongoose Error: one or more props failed the validation",
      error: Object.values(err.errors).map((error) => error.message),
    });
  }
  // valore unico già usato (per esempio un'email o il nome di un negozio)
  if (err.code === 11000) {
    return res.status(409).send({
      statusCode: 409,
      message: "Mongoose Error: Conflict found with another document",
      error: `Duplicate value for: ${Object.keys(err.keyValue ?? {}).join(", ")}`,
    });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).send({
      statusCode: 400,
      message: "Malformed JSON in request body",
      error: "The request body is not valid JSON",
    });
  }
  // errore non previsto: lo scrivo nel terminale e rispondo 500
  console.error(err);
  return res.status(500).send({
    statusCode: 500,
    message: "Internal server error",
    error:
      "An error has occurred, please try again later or contact administrators",
  });
};

module.exports = errorHandler;
