// import
import "./userCard.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatFullName } from "../../../utils/formatFullName";
import { ROLE_LABEL } from "../../../utils/roleLabel";
import Avatar from "../../common/avatar/Avatar";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// componente UserCard: card di un utente fino a 1366px.
// props: user, isSelf = sono io (non mi elimino), onEdit, onDelete
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

      {/* in basso ruolo e negozio: in alto nome ed email hanno tutta la larghezza */}
      <div className="user-card-bottom">
        <div className="user-card-role">
          <Badge color={user.role === "admin" ? "secondary" : "neutral"}>
            {ROLE_LABEL[user.role]}
          </Badge>
          <p className="user-card-detail">{detail}</p>
        </div>
        <div className="user-card-actions">
          {/* "Modifica" (su telefono solo la matita) e il cestino */}
          <Button
            variant="secondary"
            aria-label={`Modifica ${formatFullName(user)}`}
            onClick={() => onEdit(user)} // apro il modulo con la persona
          >
            <Pencil size={16} aria-hidden="true" />
            <span className="app-button-label">Modifica</span>
          </Button>
          {/* il mio account non si elimina: al posto del cestino una nota */}
          {!isSelf && (
            <Button
              variant="danger"
              className="app-button-icon"
              aria-label={`Elimina ${formatFullName(user)}`}
              onClick={() => onDelete(user)} // chiedo conferma prima di eliminare
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
