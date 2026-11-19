// import
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// lascio passare solo i ruoli indicati, es. authorizeRoles("admin"); gli altri 403
const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenException());
    }
    next();
  };

module.exports = authorizeRoles;
