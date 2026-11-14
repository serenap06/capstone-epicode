import "./panel.css";
import { useId } from "react";
import SectionHeader from "../sectionHeader/SectionHeader";

// riquadro bianco con titolo. aside: a destra del titolo; footer: in fondo al riquadro
const Panel = ({ title, aside, footer, className = "", children }) => {
  const titleId = useId();

  return (
    <section className={`panel ${className}`} aria-labelledby={titleId}>
      <SectionHeader title={title} id={titleId} aside={aside} />
      {children}
      {footer && <div className="panel-footer">{footer}</div>}
    </section>
  );
};

export default Panel;
