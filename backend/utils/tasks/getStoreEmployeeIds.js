const HttpException = require("../../exceptions");
const User = require("../../modules/users/schema");

const getStoreEmployeeIds = async (storeId) => {
  const employees = await User.find({
    store: storeId,
    role: "employee",
  }).select("_id");
  if (employees.length === 0) {
    throw new HttpException("No employees in this store", 404);
  }
  return employees.map((employee) => employee._id);
};

module.exports = getStoreEmployeeIds;
