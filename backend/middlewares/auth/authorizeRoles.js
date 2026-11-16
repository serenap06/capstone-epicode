const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// lascia passare solo i ruoli indicati, per esempio authorizeRoles("admin"); gli altri: 403.
// È una funzione che restituisce il middleware, così posso passarle i ruoli
const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenException());
    }
    next();
  };

module.exports = authorizeRoles;
