import Sidebar from "../sidebar/Sidebar";
import Topbar from "../topbar/Topbar";
import { Outlet } from "react-router-dom";
import "./appLayout.css";
import Footer from "../footer/Footer";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Outlet />
          <Footer/>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
