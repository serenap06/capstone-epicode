import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import AdminView from "./pages/adminView/AdminView.jsx";
import EmployeeView from "./pages/employeeView/EmployeeView.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminView />} />
      <Route path="/employee" element={<EmployeeView />} />
    </Routes>
  );
};

export default App;
