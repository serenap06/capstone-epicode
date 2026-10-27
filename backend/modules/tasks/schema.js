const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
    },
    description: {
      type: String,
      minlength: 1,
      maxlength: 255,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      required: true,
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    category: {
      type: String,
      default: "operations",
      enum: ["operations", "administrative"],
    },
    type: {
      type: String,
      enum: ["daily", "monthly"],
      default: "daily",
    },
  },
  { timestamps: true, strict: true },
);

module.exports = mongoose.model("Task", taskSchema, "tasks");
