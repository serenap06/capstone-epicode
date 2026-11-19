// import
import "./passwordInput.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// componente PasswordInput: campo password con l'occhio per vederla.
// props: passano tutte all'input (id, className, register di react-hook-form...)
const PasswordInput = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input">
      {/* "password" = puntini, "text" = in chiaro */}
      <input {...props} type={isVisible ? "text" : "password"} />
      <button
        type="button"
        className="password-input-toggle"
        aria-label={isVisible ? "Nascondi la password" : "Mostra la password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((prevVisible) => !prevVisible)}
      >
        {isVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
