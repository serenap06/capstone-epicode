import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import Dashboard from "./pages/admin/dashboard/Dashboard.jsx";
import EmployeeView from "./pages/employeeView/EmployeeView.jsx";
import ProtectedRoute from "./strategies/ProtectedRoute.jsx";
import AppLayout from "./components/layout/appLayout/AppLayout.jsx";

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
          <Route index element={<EmployeeView />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
