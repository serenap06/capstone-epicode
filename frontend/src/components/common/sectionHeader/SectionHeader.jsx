// import
import "./sectionHeader.css";

// componente SectionHeader: titolo di sezione. props: title, id (per Panel), aside = link o conteggio a destra
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
