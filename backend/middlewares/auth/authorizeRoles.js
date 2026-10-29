const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenException());
    }
    next();
  };

module.exports = authorizeRoles;
