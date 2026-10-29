const mongoose = require("mongoose");
const HttpException = require("../../exceptions");

const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).send({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
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
      error: Object.values(err.errors).map((e) => e.message),
    });
  }
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
  console.error(err);
  return res.status(500).send({
    statusCode: 500,
    message: "Internal server error",
    error:
      "An error has occurred, please try again later or contact administrators",
  });
};

module.exports = errorHandler;
