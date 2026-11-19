// import
const express = require("express");
// router di /api/tasks
const tasksRouter = express.Router();
const taskController = require("./controller");

const authenticate = require("../../middlewares/auth/auth");
const authorizeRole = require("../../middlewares/auth/authorizeRoles");
const validate = require("../../middlewares/validate/validate");
const { param } = require("express-validator");

const taskBodyRules = require("../../middlewares/tasks/taskBodyRules");
const taskUpdateRules = require("../../middlewares/tasks/taskUpdateRules");
const taskQueryRules = require("../../middlewares/tasks/taskQueryRules");
const taskStatusRules = require("../../middlewares/tasks/taskStatusRules");

// serve il login
tasksRouter.use(authenticate);

// task del responsabile e task del dipendente
tasksRouter.get(
  "/",
  authorizeRole("admin"),
  taskQueryRules,
  validate,
  taskController.findAll,
);
tasksRouter.get(
  "/mine",
  authorizeRole("employee"),
  taskQueryRules,
  validate,
  taskController.findMine,
);

// nuova (solo il responsabile)
tasksRouter.post(
  "/",
  authorizeRole("admin"),
  taskBodyRules,
  validate,
  taskController.create,
);

// modifica di tutto il gruppo
tasksRouter.patch(
  "/group/:groupId",
  authorizeRole("admin"),
  param("groupId").isMongoId().withMessage("Invalid task group id"),
  taskUpdateRules,
  validate,
  taskController.update,
);
// stato della propria copia (solo il dipendente)
tasksRouter.patch(
  "/:taskId/status",
  authorizeRole("employee"),
  param("taskId").isMongoId().withMessage("Invalid task id"),
  taskStatusRules,
  validate,
  taskController.updateStatus,
);

// elimina una copia o tutto il gruppo
tasksRouter.delete(
  "/:taskId",
  authorizeRole("admin"),
  param("taskId").isMongoId().withMessage("Invalid task id"),
  validate,
  taskController.deleteTask,
);
tasksRouter.delete(
  "/group/:groupId",
  authorizeRole("admin"),
  param("groupId").isMongoId().withMessage("Invalid task group id"),
  validate,
  taskController.deleteGroupTasks,
);

module.exports = tasksRouter;
