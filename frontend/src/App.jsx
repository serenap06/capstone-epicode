// import
import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Dashboard from "./pages/admin/dashboard/Dashboard.jsx";
import Home from "./pages/employee/Home.jsx";
import ProtectedRoute from "./strategies/ProtectedRoute.jsx";
import AppLayout from "./components/layout/appLayout/AppLayout.jsx";
import MyTasks from "./pages/employee/tasks/MyTasks.jsx";
import MyShifts from "./pages/employee/shifts/MyShifts.jsx";
import Tasks from "./pages/admin/tasks/Tasks.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Users from "./pages/admin/users/Users.jsx";
import Stores from "./pages/admin/stores/Stores.jsx";
import Shifts from "./pages/admin/shifts/Shifts.jsx";
import Stocks from "./pages/stocks/Stocks.jsx";
import Catalog from "./pages/products/Catalog.jsx";
import Checkout from "./pages/employee/checkout/Checkout.jsx";
import Sales from "./pages/sales/Sales.jsx";
import SupplyRequests from "./pages/supplyRequests/SupplyRequests.jsx";
import Loader from "./components/common/loader/Loader.jsx";

// il Report si scarica solo quando si apre (lazy): porta con sé Recharts, che è pesante
const Reports = lazy(() => import("./pages/admin/reports/Reports.jsx"));

// componente App: tutte le pagine con il loro indirizzo
const App = () => {
  return (
    <Routes>
      {/* login, l'unica pagina aperta a tutti */}
      <Route path="/" element={<Login />} />

      {/* responsabile: ProtectedRoute controlla il ruolo, AppLayout aggiunge barra e menu */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AppLayout />}>
          {/* index = la pagina di /admin */}
          <Route index element={<Dashboard />} />
          <Route path="shifts" element={<Shifts />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sales" element={<Sales />} />
          {/* Suspense: la rotellina mentre arriva il file del Report */}
          <Route
            path="reports"
            element={
              <Suspense fallback={<Loader />}>
                <Reports />
              </Suspense>
            }
          />
          <Route path="supply-requests" element={<SupplyRequests />} />
          <Route path="stock" element={<Stocks />} />
          <Route path="products" element={<Catalog />} />
          <Route path="users" element={<Users />} />
          <Route path="stores" element={<Stores />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* dipendente: stessa cosa con il ruolo "employee" */}
      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="shifts" element={<MyShifts />} />
          <Route path="sales" element={<Sales />} />
          <Route path="stock" element={<Stocks />} />
          <Route path="supply-requests" element={<SupplyRequests />} />
          <Route path="products" element={<Catalog />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* indirizzo che non esiste: torno al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
