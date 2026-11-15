import "./sectionHeader.css";

// titolo di una sezione con, a destra, un link o un conteggio (aside).
// id: serve a Panel per collegare il riquadro al titolo
const SectionHeader = ({ title, id, aside, className = "" }) => {
  return (
    <div className={`section-header ${className}`}>
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {aside}
    </div>
  );
};

export default SectionHeader;
