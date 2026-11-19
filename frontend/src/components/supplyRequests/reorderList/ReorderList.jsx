// import
import "./reorderList.css";
import { Plus } from "lucide-react";

import Button from "../../common/button/Button";
import Panel from "../../common/panel/Panel";

// componente ReorderList: "Da riordinare", i prodotti sotto soglia senza richiesta in attesa.
// props: stocks, onRequest = apre il modulo con prodotto e quantità già scelti
const ReorderList = ({ stocks, onRequest }) => {
  return (
    <Panel
      title="Da riordinare"
      aside={
        <span className="reorder-count">{stocks.length} sotto soglia</span>
      }
      className="mb-4"
    >
      <ul className="reorder-list">
        {stocks.map((stock) => (
          <li key={stock._id} className="reorder-row">
            <div className="reorder-info">
              <span className="reorder-name">{stock.product.name}</span>
              <span className="reorder-detail">
                {stock.amount} pz · soglia {stock.minThreshold}
              </span>
            </div>
            <Button
              variant="secondary"
              aria-label={`Richiedi ${stock.product.name}`}
              onClick={() => onRequest(stock)} // apro il modulo già compilato
            >
              <Plus size={16} aria-hidden="true" />
              Richiedi
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default ReorderList;
