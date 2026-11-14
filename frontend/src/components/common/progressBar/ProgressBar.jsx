import "./progressBar.css";

// barra di avanzamento: percent va da 0 a 100
const ProgressBar = ({ percent, className = "" }) => {
  return (
    <div className={`progress-track ${className}`} aria-hidden="true">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default ProgressBar;
