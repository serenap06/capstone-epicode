// variabili del file .env
require("dotenv").config();
// ora italiana: sui server di deploy è UTC e "oggi" partirebbe all'una di notte
process.env.TZ = "Europe/Rome";
// import
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const logger = require("./middlewares/globals/logger");

// middleware degli errori
const errorHandler = require("./middlewares/errors/errorHandler");

// rotte
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

// app
const app = express();

// middleware globali: log delle richieste, JSON nel body, CORS solo per il frontend
app.use(logger);
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// controllo veloce che il server sia acceso
app.get("/api/health", (req, res) => res.send({ status: "ok" }));
// rotte dell'API
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

// gestione degli errori, sempre per ultima
app.use(errorHandler);

// avvio: prima il database, poi il server
const startServer = async (port, server) => {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server up and running on port ${port}`);
  });
};

startServer(process.env.PORT, app);
