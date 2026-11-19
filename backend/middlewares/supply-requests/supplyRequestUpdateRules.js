// import
const { body } = require("express-validator");

// regole per accogliere o respingere: il motivo serve solo per respingere (.if)
const supplyRequestUpdateRules = [
  body("state")
    .isIn(["handled", "rejected"])
    .withMessage("State must be handled or rejected"),
  body("reason")
    .if(body("state").equals("rejected"))
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ max: 200 })
    .withMessage("Reason must be at most 200 characters"),
];

module.exports = supplyRequestUpdateRules;
