// tutte le pagine dell'app con il loro indirizzo
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
import Stores from "./pages/admin/stores/Stores.jsx";
import Shifts from "./pages/admin/shifts/Shifts.jsx";
import Stocks from "./pages/stocks/Stocks.jsx";

const App = () => {
  return (
    <Routes>
      {/* pagina di accesso, l'unica aperta a tutti */}
      <Route path="/" element={<Login />} />

      {/* responsabile: ProtectedRoute controlla il ruolo, AppLayout aggiunge barra e menu */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AppLayout />}>
          {/* index = la pagina che si apre su /admin */}
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="shifts" element={<Shifts/>} />
          <Route path="stock" element={<Stocks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="stores" element={<Stores />} />
        </Route>
      </Route>

      {/* pagine del dipendente, stessa logica con ruolo "employee" */}
      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="shifts" element={<MyShifts />} />
          <Route path="stock" element={<Stocks />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* qualsiasi indirizzo che non esiste riporta al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
