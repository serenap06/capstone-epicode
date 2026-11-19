// import
import "./userTable.css";
import { Pencil, Trash2 } from "lucide-react";
import { formatFullName } from "../../../utils/formatFullName";
import { ROLE_LABEL } from "../../../utils/roleLabel";
import Avatar from "../../common/avatar/Avatar";
import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";

// componente UserTable: tabella degli utenti da 1366px.
// props: users, currentUserId = chi è collegato (non si elimina), onEdit, onDelete
const UserTable = ({ users, currentUserId, onEdit, onDelete }) => {
  return (
    <div className="app-card app-table-wrap">
      <table className="app-table user-table">
        <thead>
          <tr>
            <th scope="col">Persona</th>
            <th scope="col">Email</th>
            <th scope="col">Ruolo</th>
            <th scope="col">Negozio</th>
            <th scope="col">Ore contratto</th>
            <th scope="col">
              <span className="visually-hidden">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user._id === currentUserId;
            return (
              <tr key={user._id}>
                <td>
                  <div className="user-table-person">
                    <Avatar user={user} size={36} />
                    <span className="user-table-name">
                      {formatFullName(user)}
                    </span>
                  </div>
                </td>
                <td className="user-table-muted">{user.email}</td>
                <td>
                  {/* viola per il responsabile, grigio per i dipendenti */}
                  <Badge
                    color={user.role === "admin" ? "secondary" : "neutral"}
                  >
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </td>
                <td>{user.store?.name ?? "—"}</td>
                <td>
                  {user.weeklyHours != null ? `${user.weeklyHours} h` : "—"}
                </td>
                <td>
                  <div className="user-table-actions">
                    <Button
                      variant="secondary"
                      aria-label={`Modifica ${formatFullName(user)}`}
                      onClick={() => onEdit(user)} // apro il modulo con la persona
                    >
                      <Pencil size={16} aria-hidden="true" />
                      Modifica
                    </Button>
                    {/* title: il suggerimento passando con il mouse */}
                    <Button
                      variant="danger"
                      className="app-button-icon"
                      aria-label={
                        isSelf
                          ? "Non puoi eliminare il tuo account"
                          : `Elimina ${formatFullName(user)}`
                      }
                      title={
                        isSelf ? "Non puoi eliminare il tuo account" : undefined
                      }
                      disabled={isSelf} // il mio account non si elimina
                      onClick={() => onDelete(user)} // chiedo conferma prima di eliminare
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
