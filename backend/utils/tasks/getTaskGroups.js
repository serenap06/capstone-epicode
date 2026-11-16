const Task = require("../../modules/tasks/schema");
const User = require("../../modules/users/schema");
const Store = require("../../modules/stores/schema");

// unisce le copie della stessa task (stesso groupId) in un solo oggetto:
// i campi comuni una volta, e in assignees ogni persona con il suo stato
const getTaskGroups = async (groupIds) => {
  const groups = await Task.aggregate([
    { $match: { groupId: { $in: groupIds } } },
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
    { $sort: { dueDate: 1 } },
  ]);

  // aggregate restituisce solo gli id: aggiungo il nome del negozio e delle persone
  await Store.populate(groups, { path: "store", select: "name" });
  await User.populate(groups, {
    path: "assignees.user",
    select: "name surname",
  });

  return groups;
};

module.exports = getTaskGroups;
