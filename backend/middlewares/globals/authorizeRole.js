const authorizeRole = (req, res, next) => {
  const { role } = req.body;

  if (role !== "admin") {
    return res.status(403).send({
      statusCode: 403,
      message: "You need to be an admin to access this resource",
    });
  }
  next();
};

module.exports = authorizeRole;
