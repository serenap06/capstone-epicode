// import
const taskService = require("./service");

// GET /api/tasks: le task del responsabile, raggruppate (a pagine se arriva page)
const findAll = async (req, res, next) => {
  try {
    const {
      store,
      assignedTo,
      status,
      category,
      type,
      isGlobal,
      from,
      to,
      sortBy,
      order,
      page,
      limit,
    } = req.query;
    const result = await taskService.findAll({
      store,
      assignedTo,
      status,
      category,
      type,
      isGlobal,
      from,
      to,
      sortBy,
      order,
      page,
      limit,
    });
    res.status(200).send({
      statusCode: 200,
      tasks: result.tasks,
      totals: result.totals,
      pagination: result.pagination,
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/tasks/mine: le task del dipendente collegato
const findMine = async (req, res, next) => {
  try {
    const { status, category, type, isGlobal, from, to } = req.query;
    const tasks = await taskService.findMine(
      { status, category, type, isGlobal, from, to },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      tasks,
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/tasks: nuova task, una copia per persona
const create = async (req, res, next) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      category,
      type,
      isGlobal,
      store,
    } = req.body;
    const tasks = await taskService.create(
      {
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        category,
        type,
        isGlobal,
        store,
      },
      req.user,
    );
    res.status(201).send({
      statusCode: 201,
      message: "Task created successfully",
      tasks,
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/tasks/group/:groupId: modifico tutte le copie della task
const update = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { title, description, dueDate, priority, category, type } = req.body;
    const tasks = await taskService.update(groupId, {
      title,
      description,
      dueDate,
      priority,
      category,
      type,
    });
    res.status(200).send({
      statusCode: 200,
      message: "Task updated successfully",
      tasks,
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/tasks/:taskId/status: il dipendente segna fatta o da fare la sua copia
const updateStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const task = await taskService.updateStatus(taskId, { status }, req.user);
    res.status(200).send({
      statusCode: 200,
      message: "Task status updated successfully",
      task,
    });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/tasks/:taskId: elimino una copia
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    await taskService.deleteTask(taskId);
    res.status(200).send({
      statusCode: 200,
      message: "Task deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/tasks/group/:groupId: elimino la task per tutti
const deleteGroupTasks = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    await taskService.deleteGroupTasks(groupId);
    res.status(200).send({
      statusCode: 200,
      message: "Tasks deleted successfully",
    });
  } catch (e) {
    next(e);
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
