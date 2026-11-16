import "./passwordInput.css";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// campo password con il bottone a occhio per vederla in chiaro.
// ...props passa all'input tutto il resto: id, className, placeholder e quello di
// register di react-hook-form (con React 19 anche il ref arriva così)
const PasswordInput = (props) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input">
      {/* type cambia tra "password" (puntini) e "text" (in chiaro) */}
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
