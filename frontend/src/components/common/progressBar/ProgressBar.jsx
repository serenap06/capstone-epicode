// import
import "./progressBar.css";

// componente ProgressBar: barra da 0 a 100 (aria-hidden: il numero è già scritto accanto).
// La larghezza cambia sempre: per questo è l'unico stile inline
const ProgressBar = ({ percent, className = "" }) => {
  return (
    <div className={`progress-track ${className}`} aria-hidden="true">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
