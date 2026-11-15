// punto di partenza: React disegna l'app nel div "root" di index.html
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// prima Bootstrap e poi index.css, così le mie regole vincono
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";

// StrictMode: controlli in sviluppo (per questo in locale gli useEffect partono due volte);
// BrowserRouter: gli indirizzi delle pagine; AuthProvider: l'utente collegato
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
