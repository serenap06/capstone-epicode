const mongoose = require("mongoose");
const Task = require("./schema");
const getStoreEmployeeIds = require("../../utils/tasks/getStoreEmployeeIds");
const checkUserBelongsToStore = require("../../utils/checkUserBelongsToStore");
const getTaskGroups = require("../../utils/tasks/getTaskGroups");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

const findAll = async ({
  store,
  assignedTo,
  status,
  category,
  type,
  isGlobal,
  from,
  to,
}) => {
  const taskFilter = {};
  if (store) taskFilter.store = store;
  if (assignedTo) taskFilter.assignedTo = assignedTo;
  if (status) taskFilter.status = status;
  if (category) taskFilter.category = category;
  if (type) taskFilter.type = type;
  if (isGlobal !== undefined) taskFilter.isGlobal = isGlobal;
  if (from || to) {
    taskFilter.dueDate = {};
    if (from) taskFilter.dueDate.$gte = new Date(from);
    if (to) taskFilter.dueDate.$lte = new Date(to);
  }

  const groupIds = await Task.distinct("groupId", taskFilter);
  return getTaskGroups(groupIds);
};

const findMine = async (
  { status, category, type, isGlobal, from, to },
  currentUser,
) => {
  const taskFilter = { assignedTo: currentUser._id };
  if (status) taskFilter.status = status;
  if (category) taskFilter.category = category;
  if (type) taskFilter.type = type;
  if (isGlobal !== undefined) taskFilter.isGlobal = isGlobal;
  if (from || to) {
    taskFilter.dueDate = {};
    if (from) taskFilter.dueDate.$gte = new Date(from);
    if (to) taskFilter.dueDate.$lte = new Date(to);
  }
  return Task.find(taskFilter).populate("store", "name").sort({ dueDate: 1 });
};

const create = async (taskData, currentUser) => {
  const { isGlobal, assignedTo, store, ...commonFields } = taskData;

  const assigneeIds = isGlobal
    ? await getStoreEmployeeIds(store)
    : [(await checkUserBelongsToStore(assignedTo, store))._id];

  const groupId = new mongoose.Types.ObjectId();

  const taskToCreate = assigneeIds.map((userId) => ({
    ...commonFields,
    store,
    isGlobal: Boolean(isGlobal),
    assignedTo: userId,
    createdBy: currentUser._id,
    groupId,
  }));
  return Task.insertMany(taskToCreate);
};

const update = async (groupId, taskGroupData) => {
  const fieldsToUpdate = {};
  Object.entries(taskGroupData).forEach(([field, value]) => {
    if (value !== undefined) fieldsToUpdate[field] = value;
  });
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new HttpException("No fields to update", 400);
  }
  const result = await Task.updateMany(
    { groupId },
    { $set: fieldsToUpdate },
    { runValidators: true },
  );
  if (result.matchedCount === 0) {
    throw new NotFoundException("Task group not found");
  }
  return getTaskGroups([new mongoose.Types.ObjectId(groupId)]);
};

const updateStatus = async (taskId, { status }, currentUser) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundException("Task not found");
  }
  if (task.assignedTo.toString() !== currentUser._id.toString()) {
    throw new ForbiddenException("You cannot update this task");
  }
  task.status = status;
  task.completedAt = status === "done" ? new Date() : undefined;
  await task.save();

  return task;
};

const deleteTask = async (taskId) => {
  const deletedTask = await Task.findByIdAndDelete(taskId);
  if (!deletedTask) {
    throw new NotFoundException("Task not found");
  }
};
const deleteGroupTasks = async (groupId) => {
  const deletedGroupTasks = await Task.deleteMany({ groupId });
  if (deletedGroupTasks.deletedCount === 0) {
    throw new NotFoundException("Task Group not found");
  }
};

module.exports = {
  findAll,
  findMine,
  create,
  update,
  updateStatus,
  deleteTask,
  deleteGroupTasks,
};
