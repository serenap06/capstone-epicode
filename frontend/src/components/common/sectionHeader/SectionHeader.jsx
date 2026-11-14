import "./sectionHeader.css";

// titolo di una sezione con, a destra, un link o un conteggio (aside)
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
