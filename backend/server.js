require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./middlewares/globals/logger");

// middleware
const errorHandler = require("./middlewares/errors/errorHandler");

//routes
const authRouter = require("./modules/auth/routes");
const usersRouter = require("./modules/users/routes");
const storesRouter = require("./modules/stores/routes");
const shiftsRouter = require("./modules/shifts/routes");
const tasksRouter = require("./modules/tasks/routes");
const productsRouter = require("./modules/products/routes");
const stockRouter = require("./modules/stock/routes");
const supplyRequestsRouter = require("./modules/supply-requests/routes");
const dashboardRouter = require("./modules/dashboard/routes");
const salesRouter = require("./modules/sales/routes");
const reportsRouter = require("./modules/reports/routes");

const app = express();

app.use(logger);
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get("/api/health", (req, res) => res.send({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/shifts", shiftsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/products", productsRouter);
app.use("/api/stocks", stockRouter);
app.use("/api/supply-requests", supplyRequestsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/sales", salesRouter);
app.use("/api/reports", reportsRouter);

app.use(errorHandler);

const startServer = async (port, server) => {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
};

startServer(process.env.PORT, app);
