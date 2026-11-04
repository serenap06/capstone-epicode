const express = require("express");
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

tasksRouter.use(authenticate);

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

tasksRouter.post(
  "/",
  authorizeRole("admin"),
  taskBodyRules,
  validate,
  taskController.create,
);

tasksRouter.patch(
  "/group/:groupId",
  authorizeRole("admin"),
  param("groupId").isMongoId().withMessage("Invalid task group id"),
  taskUpdateRules,
  validate,
  taskController.update,
);
tasksRouter.patch(
  "/:taskId/status",
  authorizeRole("employee"),
  param("taskId").isMongoId().withMessage("Invalid task id"),
  taskStatusRules,
  validate,
  taskController.updateStatus,
);

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
