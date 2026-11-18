const mongoose = require("mongoose");
const Task = require("./schema");
const Store = require("../stores/schema");
const User = require("../users/schema");
const getStoreEmployeeIds = require("../../utils/tasks/getStoreEmployeeIds");
const checkUserBelongsToStore = require("../../utils/checkUserBelongsToStore");
const getTaskGroups = require("../../utils/tasks/getTaskGroups");
const buildTaskFilter = require("../../utils/tasks/buildTaskFilter");
const buildPagination = require("../../utils/buildPagination");
const NotFoundException = require("../../exceptions/auth/NotFoundException");
const HttpException = require("../../exceptions");
const ForbiddenException = require("../../exceptions/auth/ForbiddenException");

// task del responsabile: cerco i gruppi che rispettano i filtri e li restituisco
// raggruppati (una task con dentro tutte le persone assegnate).
// Senza page tutte; con page una pagina sola in ordine di scadenza, più quante sono in corso.
// Con page lo stato vale per il gruppo: "done" = l'hanno finita tutti, "pending" = qualcuno no
const findAll = async ({
  store,
  assignedTo,
  status,
  page,
  limit = 10,
  ...filters
}) => {
  // senza page: come prima (lo stato filtra le singole copie)
  if (!page) {
    const taskFilter = buildTaskFilter({ ...filters, status });
    if (store) taskFilter.store = store;
    if (assignedTo) taskFilter.assignedTo = assignedTo;
    const groupIds = await Task.distinct("groupId", taskFilter);
    const tasks = await getTaskGroups(groupIds);
    return { tasks };
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  // il filtro delle copie, senza lo stato; ObjectId perché aggregate non converte gli id
  const taskFilter = buildTaskFilter(filters);
  if (store) taskFilter.store = new mongoose.Types.ObjectId(String(store));
  if (assignedTo) {
    taskFilter.assignedTo = new mongoose.Types.ObjectId(String(assignedTo));
  }

  // lo stato del gruppo, calcolato dopo $group (isDone: true se tutte le copie sono fatte)
  const statusMatch = [];
  if (status === "done") statusMatch.push({ $match: { isDone: true } });
  if (status === "pending") statusMatch.push({ $match: { isDone: false } });

  const [result] = await Task.aggregate([
    { $match: taskFilter },
    // una riga per gruppo: i campi comuni una volta, le persone in assignees
    {
      $group: {
        _id: "$groupId",
        title: { $first: "$title" },
        description: { $first: "$description" },
        dueDate: { $first: "$dueDate" },
        priority: { $first: "$priority" },
        category: { $first: "$category" },
        type: { $first: "$type" },
        isGlobal: { $first: "$isGlobal" },
        store: { $first: "$store" },
        assignees: {
          $push: {
            taskId: "$_id",
            user: "$assignedTo",
            status: "$status",
            completedAt: "$completedAt",
          },
        },
      },
    },
    // isDone: true se nessuna copia è ancora da fare
    {
      $addFields: {
        isDone: { $not: [{ $in: ["pending", "$assignees.status"] }] },
      },
    },
    // $facet: la pagina, quante passano il filtro dello stato (per le pagine)
    // e quante sono in corso (per il sottotitolo, senza il filtro dello stato)
    {
      $facet: {
        tasks: [
          ...statusMatch,
          { $sort: { dueDate: 1, _id: 1 } },
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
        ],
        total: [...statusMatch, { $count: "count" }],
        open: [{ $match: { isDone: false } }, { $count: "count" }],
      },
    },
  ]);

  // aggregate restituisce solo gli id: aggiungo il nome del negozio e delle persone
  await Store.populate(result.tasks, { path: "store", select: "name" });
  await User.populate(result.tasks, {
    path: "assignees.user",
    select: "name surname",
  });

  // total e open sono vuoti quando nessuna task li rispetta
  return {
    tasks: result.tasks,
    totals: { openCount: result.open[0]?.count ?? 0 },
    pagination: buildPagination(
      pageNumber,
      limitNumber,
      result.total[0]?.count ?? 0,
    ),
  };
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
