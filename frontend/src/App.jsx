import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import AdminView from "./pages/adminView/AdminView.jsx";
import EmployeeView from "./pages/employeeView/EmployeeView.jsx";
import ProtectedRoute from "./strategies/ProtectedRoute.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute role={"admin"} />}>
        <Route path="/admin" element={<AdminView />} />
      </Route>
      <Route element={<ProtectedRoute role={"employee"} />}>
        <Route path="/employee" element={<EmployeeView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
