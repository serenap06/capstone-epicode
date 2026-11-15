// punto di partenza dell'app: qui React prende il div "root" di index.html e ci disegna tutto dentro
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// prima il CSS di Bootstrap, poi il mio index.css, così le mie regole vincono su quelle di Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";

// l'ordine dei contenitori conta:
// - StrictMode: in sviluppo segnala errori comuni (per questo gli useEffect partono due volte in locale)
// - BrowserRouter: permette di cambiare pagina con gli indirizzi (/admin, /employee/tasks...)
// - AuthProvider: rende disponibile a tutta l'app l'utente collegato, login e logout
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
