// import
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// schema dell'utente
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false = la password non arriva mai nelle risposte
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "employee"],
      default: "employee",
    },
    // il negozio serve solo ai dipendenti
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: function () {
        return this.role === "employee";
      },
    },
    avatar: {
      type: String,
      trim: true,
    },
    weeklyHours: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true, strict: true },
);
// prima di salvare cripto la password, solo se è nuova o cambiata
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// modello User, collection "users"
module.exports = mongoose.model("User", userSchema, "users");
