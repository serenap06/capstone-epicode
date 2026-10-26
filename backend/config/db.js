const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected successfully");
  } catch (e) {
    console.error("MongoDB error connection", e.message);
    process.exit(1);
  }
};

module.exports = connectDB;
