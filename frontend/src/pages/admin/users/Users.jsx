import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../hooks/useAuth";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { deleteUser } from "../../../api/users";
import { formatFullName } from "../../../utils/formatFullName";

import AddButton from "../../../components/common/addButton/AddButton";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FormModal from "../../../components/common/formModal/FormModal";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import UserCard from "../../../components/users/userCard/UserCard";
import UserForm from "../../../components/users/userForm/UserForm";
import UserTable from "../../../components/users/userTable/UserTable";

// pagina Utenti del responsabile: tutte le persone, in ordine di cognome (lo fa il server)
const Users = () => {
  // currentUser: chi è collegato; setUser per aggiornare la barra in alto se modifico me stessa
  const { user: currentUser, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: userToEdit è la persona da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  // conferma dell'eliminazione
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo
  const isPhone = useIsPhone();
  // fino a 1280px le card (una colonna su telefono, due da tablet in su):
  // la tabella con il menu a sinistra ci sta comoda solo sopra
  const showCards = useMediaQuery("(max-width: 1280px)");

  useEffect(() => {
    loadData("/users", (data) => setUsers(data.users), setError);
  }, [refreshCount]);

  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  const openNewForm = () => {
    setUserToEdit(null);
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setUserToEdit(user);
    setShowForm(true);
  };

  // dopo il salvataggio chiudo e ricarico (il server rimanda la persona senza il nome del negozio).
  // Se ho modificato me stessa, ricarico anche il mio profilo per la barra in alto
  const handleSaved = (savedUser) => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
    if (savedUser?._id === currentUser._id) {
      loadData("/users/me", (data) => setUser(data.user), setError);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete._id);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userToDelete._id),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // "1 persona", "5 persone"
  const peopleLabel = users.length === 1 ? "persona" : "persone";

  // "Nuovo utente": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton label="Nuovo utente" iconOnly={isPhone} onClick={openNewForm} />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Utenti"
        titleAside={isPhone && addButton}
        subtitle={`${users.length} ${peopleLabel} · in ordine di cognome`}
        error={error}
      >
        {!isPhone && addButton}
      </PageHeader>

      {users.length === 0 && !error && <Message>Nessun utente</Message>}

      {users.length > 0 &&
        (showCards ? (
          <Row xs={1} md={2} className="g-3">
            {users.map((user) => (
              <Col key={user._id}>
                <UserCard
                  user={user}
                  isSelf={user._id === currentUser._id}
                  onEdit={openEditForm}
                  onDelete={setUserToDelete}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <UserTable
            users={users}
            currentUserId={currentUser._id}
            onEdit={openEditForm}
            onDelete={setUserToDelete}
          />
        ))}

      <FormModal
        show={showForm}
        title={userToEdit ? "Modifica utente" : "Nuovo utente"}
        onClose={() => setShowForm(false)}
      >
        <UserForm
          user={userToEdit}
          stores={stores}
          isSelf={userToEdit?._id === currentUser._id}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* eliminando una persona spariscono anche i suoi turni e le sue task */}
      <ConfirmDialog
        show={!!userToDelete}
        title="Eliminare l'utente?"
        message={`${userToDelete ? formatFullName(userToDelete) : ""} non potrà più accedere e spariranno anche i suoi turni e le sue task. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </Container>
  );
};

export default Users;
