// import (prima Bootstrap e poi index.css, così le mie regole vincono)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";

// avvio: StrictMode (controlli in sviluppo), BrowserRouter (indirizzi), AuthProvider (utente collegato)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
