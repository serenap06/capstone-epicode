// import
import { isLowStock } from "../../../utils/isLowStock";
import Badge from "../../common/badge/Badge";

// componente StockStatusBadge: "Sotto soglia" arancio oppure "Ok" verde. props: stock
const StockStatusBadge = ({ stock }) => {
  return isLowStock(stock) ? (
    <Badge color="warning">Sotto soglia</Badge>
  ) : (
    <Badge color="success">Ok</Badge>
  );
};

export default StockStatusBadge;
