import "./userCard.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatFullName } from "../../../utils/formatFullName";
import { ROLE_LABEL } from "../../../utils/roleLabel";
import Avatar from "../../common/avatar/Avatar";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// card di un utente, per il telefono: foto, nome ed email, ruolo, negozio e ore,
// bottoni con la sola icona (stesse props di UserTable, per un utente solo)
const UserCard = ({ user, isSelf, onEdit, onDelete }) => {
  // "Bookshop Museo · 40 h" per i dipendenti, "Tutti i negozi" per il responsabile
  const detail =
    user.role === "admin"
      ? "Tutti i negozi"
      : `${user.store?.name ?? "Nessun negozio"}${user.weeklyHours != null ? ` · ${user.weeklyHours} h` : ""}`;

  return (
    <article className="app-card user-card">
      <div className="user-card-top">
        <Avatar user={user} size={44} />
        <div className="user-card-info">
          <h2 className="user-card-name">{formatFullName(user)}</h2>
          <p className="user-card-email">{user.email}</p>
        </div>
      </div>

      {/* in basso a sinistra ruolo e negozio, uno sotto l'altro: così in alto
          nome ed email hanno tutta la larghezza e l'email non va a capo */}
      <div className="user-card-bottom">
        <div className="user-card-role">
          <Badge color={user.role === "admin" ? "secondary" : "neutral"}>
            {ROLE_LABEL[user.role]}
          </Badge>
          <p className="user-card-detail">{detail}</p>
        </div>
        <div className="user-card-actions">
          <Button
            variant="secondary"
            className="app-button-icon"
            aria-label={`Modifica ${formatFullName(user)}`}
            onClick={() => onEdit(user)}
          >
            <Pencil size={16} aria-hidden="true" />
          </Button>
          {/* il proprio account non si elimina: al posto del cestino una nota */}
          {!isSelf && (
            <Button
              variant="danger"
              className="app-button-icon"
              aria-label={`Elimina ${formatFullName(user)}`}
              onClick={() => onDelete(user)}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      {isSelf && (
        <p className="form-hint m-0">Non puoi eliminare il tuo account</p>
      )}
    </article>
  );
};

export default UserCard;
