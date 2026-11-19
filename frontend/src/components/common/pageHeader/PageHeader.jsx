// import
import { Col, Row } from "react-bootstrap";
import Message from "../message/Message";

// componente PageHeader: titolo, sottotitolo ed errore; a destra i children.
// props: titleAside = accanto al titolo (il "+" su telefono), subtitleAside = accanto al sottotitolo
const PageHeader = ({
  title,
  titleAside,
  subtitle,
  subtitleAside,
  error,
  children,
}) => {
  return (
    // la colonna di destra in basso
    <Row className="align-items-end g-3 mb-4">
      <Col>
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {titleAside}
        </div>
        {subtitle && (
          <div className="page-subtitle-row">
            <p className="page-subtitle">{subtitle}</p>
            {subtitleAside}
          </div>
        )}
        {error && <Message type="error">{error}</Message>}
      </Col>
      {/* colonna di destra solo se serve: tutta la riga su telefono */}
      {children && (
        <Col xs={12} md="auto">
          {children}
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
