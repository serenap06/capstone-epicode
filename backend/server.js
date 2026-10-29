require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

// middleware
const errorHandler = require("./middlewares/errors/errorHandler")

//routes
const authRouter = require("./modules/auth/routes");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get("/api/health", (req, res) => res.send({ status: "ok" }));
app.use("/api/auth",authRouter)

app.use(errorHandler)

const startServer = async (port, server) => {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
};

startServer(process.env.PORT, app);
