import Sidebar from "../sidebar/Sidebar";
import Topbar from "../topbar/Topbar";
import { Outlet } from "react-router-dom";
import "./appLayout.css";
import Footer from "../footer/Footer";

// struttura comune a tutte le pagine dopo il login:
// barra in alto, menu a sinistra (in basso su telefono) e al centro la pagina.
// Outlet è il punto in cui React Router mette la pagina dell'indirizzo attuale
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
