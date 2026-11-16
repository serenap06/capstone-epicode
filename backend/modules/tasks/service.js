const mongoose = require("mongoose");
const Task = require("./schema");
const getStoreEmployeeIds = require("../../utils/tasks/getStoreEmployeeIds");
const checkUserBelongsToStore = require("../../utils/checkUserBelongsToStore");
const getTaskGroups = require("../../utils/tasks/getTaskGroups");
const buildTaskFilter = require("../../utils/tasks/buildTaskFilter");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// task del responsabile: cerco i gruppi che rispettano i filtri e li restituisco
// raggruppati (una task con dentro tutte le persone assegnate)
const findAll = async ({ store, assignedTo, ...filters }) => {
  const taskFilter = buildTaskFilter(filters);
  if (store) taskFilter.store = store;
  if (assignedTo) taskFilter.assignedTo = assignedTo;

  const groupIds = await Task.distinct("groupId", taskFilter);
  return getTaskGroups(groupIds);
};

// task del dipendente: solo le sue copie, una per task
const findMine = async (filters, currentUser) => {
  const taskFilter = {
    ...buildTaskFilter(filters),
    assignedTo: currentUser._id,
  };
  return Task.find(taskFilter).populate("store", "name").sort({ dueDate: 1 });
};

// crea una copia della task per ogni persona, tutte con lo stesso groupId.
// Globale: tutti i dipendenti del negozio; altrimenti controllo che ognuno lavori lì
const create = async (taskData, currentUser) => {
  const { isGlobal, assignedTo, store, ...commonFields } = taskData;

  const assigneeIds = isGlobal
    ? await getStoreEmployeeIds(store)
    : (
        await Promise.all(
          assignedTo.map((userId) => checkUserBelongsToStore(userId, store)),
        )
      ).map((user) => user._id);

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

// modifica tutte le copie del gruppo insieme (i campi non mandati restano uguali)
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

// il dipendente segna fatta (o da fare) solo la sua copia; completedAt salva l'orario
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
