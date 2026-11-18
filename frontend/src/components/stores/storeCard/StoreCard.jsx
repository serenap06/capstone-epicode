import "./storeCard.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatFullName } from "../../../utils/formatFullName";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// card di un negozio: indirizzo, personale, Modifica ed Elimina.
// Con del personale "Elimina" è spento
const StoreCard = ({ store, onEdit, onDelete }) => {
  const staffCount = store.users.length;
  const hasStaff = staffCount > 0;

  return (
    <article className="app-card store-card">
      <div>
        <h2 className="store-card-title">{store.name}</h2>
        <p className="store-card-address">
          {store.address} · {store.city}
        </p>
      </div>

      <p className="store-card-staff">Personale · {staffCount}</p>
      {hasStaff ? (
        <div className="store-card-people">
          {store.users.map((user) => (
            <Badge key={user._id} color="secondary">
              {formatFullName(user)}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="form-hint m-0">Nessun dipendente</p>
      )}

      {/* aria-label con il nome: in pagina ci sono più bottoni uguali.
          Come nelle altre card: "Modifica" (su telefono solo la matita) e il cestino */}
      <div className="store-card-actions">
        <Button
          variant="secondary"
          aria-label={`Modifica ${store.name}`}
          onClick={() => onEdit(store)}
        >
          <Pencil size={16} aria-hidden="true" />
          <span className="app-button-label">Modifica</span>
        </Button>
        <Button
          variant="danger"
          className="app-button-icon"
          aria-label={`Elimina ${store.name}`}
          onClick={() => onDelete(store)}
          disabled={hasStaff}
        >
          <Trash2 size={16} aria-hidden="true" />
        </Button>
      </div>
      {hasStaff && (
        <p className="form-hint m-0">
          Per eliminarlo, sposta prima il personale in un altro negozio
        </p>
      )}
    </article>
  );
};

export default StoreCard;
