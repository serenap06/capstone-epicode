// import
import "./panel.css";
import { useId } from "react";
import SectionHeader from "../sectionHeader/SectionHeader";

// componente Panel: riquadro bianco con titolo. props: title, aside = a destra del titolo, footer, className
const Panel = ({ title, aside, footer, className = "", children }) => {
  // id per collegare il riquadro al titolo
  const titleId = useId();

  return (
    <section
      className={`app-card panel ${className}`}
      aria-labelledby={titleId}
    >
      {/* titolo, con il suo id */}
      <SectionHeader title={title} id={titleId} aside={aside} />
      {children}
      {footer && <div className="panel-footer">{footer}</div>}
    </section>
  );
};

export default Panel;
