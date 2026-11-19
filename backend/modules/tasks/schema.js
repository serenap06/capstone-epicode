// import
const mongoose = require("mongoose");

// schema della task: una copia per ogni persona assegnata
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
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
    // stesso groupId = copie della stessa task
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
    // globale: assegnata a tutti i dipendenti del negozio
    isGlobal: {
      type: Boolean,
      default: false,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    completedAt: { type: Date },
  },
  { timestamps: true, strict: true },
);

// indici per le ricerche più frequenti
taskSchema.index({ groupId: 1 });
taskSchema.index({ store: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1 });

// modello Task, collection "tasks"
module.exports = mongoose.model("Task", taskSchema, "tasks");
