import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Dashboard from "./pages/admin/dashboard/Dashboard.jsx";
import Home from "./pages/employee/Home.jsx";
import ProtectedRoute from "./strategies/ProtectedRoute.jsx";
import AppLayout from "./components/layout/appLayout/AppLayout.jsx";
import MyTasks from "./pages/employee/tasks/MyTasks.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute role={"admin"} />}>
        <Route path="/admin" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role={"employee"} />}>
        <Route path="/employee" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="tasks" element={<MyTasks />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
