// import
import Badge from "../../common/badge/Badge";

// componente SupplyStateBadge: "In attesa" arancio, "Accolta" magenta, "Respinta" grigio. props: request
const SupplyStateBadge = ({ request }) => {
  if (request.state === "open") return <Badge color="warning">In attesa</Badge>;
  if (request.state === "handled")
    return <Badge color="primary">Accolta</Badge>;
  return <Badge color="neutral">Respinta</Badge>;
};

export default SupplyStateBadge;
