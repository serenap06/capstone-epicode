// import
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../../hooks/useAuth";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { useShowCards } from "../../../hooks/useShowCards";
import { loadData } from "../../../api/loadData";
import { deleteUser } from "../../../api/users";
import { formatFullName } from "../../../utils/formatFullName";
import { PAGE_SIZE } from "../../../utils/pageSize";
import { toQuery } from "../../../utils/toQuery";

import AddButton from "../../../components/common/addButton/AddButton";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FormModal from "../../../components/common/formModal/FormModal";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Pagination from "../../../components/common/pagination/Pagination";
import UserCard from "../../../components/users/userCard/UserCard";
import UserForm from "../../../components/users/userForm/UserForm";
import UserTable from "../../../components/users/userTable/UserTable";

// componente Users: il personale in ordine di cognome, 10 per pagina (le fa il server)
const Users = () => {
  // utente collegato (setUser aggiorna la barra in alto se modifico me stessa)
  const { user: currentUser, setUser } = useAuth();
  // una pagina di persone, il totale e le pagine
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // negozi, per il modulo
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica la lista
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: persona da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  // conferma dell'eliminazione
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo
  const isPhone = useIsPhone();
  // fino a 1366px le card, sopra la tabella
  const showCards = useShowCards();

  // prendo gli utenti al cambio pagina e al refreshCount
  useEffect(() => {
    loadData(
      `/users?${toQuery({ page, limit: PAGE_SIZE })}`,
      (data) => {
        setUsers(data.users);
        setTotalCount(data.totals.count);
        setTotalPages(data.pagination.totalPages);
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima
        if (
          page > data.pagination.totalPages &&
          data.pagination.totalPages > 0
        ) {
          setPage(data.pagination.totalPages);
        }
      },
      setError,
    ).finally(() => setIsLoading(false));
  }, [page, refreshCount]);

  // prendo i negozi una volta sola
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  // "Nuovo utente": modulo vuoto
  const openNewForm = () => {
    setUserToEdit(null);
    setShowForm(true);
  };

  // matita: modulo con la persona
  const openEditForm = (user) => {
    setUserToEdit(user);
    setShowForm(true);
  };

  // salvato: chiudo e ricarico; se ero io, ricarico anche il mio profilo
  const handleSaved = (savedUser) => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
    if (savedUser?._id === currentUser._id) {
      loadData("/users/me", (data) => setUser(data.user), setError);
    }
  };

  // elimino e ricarico; finally chiude la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteUser(userToDelete._id);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // "1 persona", "5 persone"
  const peopleLabel = totalCount === 1 ? "persona" : "persone";

  // "Nuovo utente": su telefono solo il "+"
  const addButton = (
    <AddButton label="Nuovo utente" iconOnly={isPhone} onClick={openNewForm} />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Utenti"
        titleAside={isPhone && addButton}
        subtitle={`${totalCount} ${peopleLabel} · in ordine di cognome`}
        error={error}
      >
        {/* da tablet il bottone a destra */}
        {!isPhone && addButton}
      </PageHeader>

      {isLoading && <Loader />}
      {!isLoading && users.length === 0 && !error && (
        <Message>Nessun utente</Message>
      )}

      {/* fino a 1366px le card, sopra la tabella */}
      {users.length > 0 &&
        (showCards ? (
          <Row xs={1} md={2} className="g-3">
            {users.map((user) => (
              <Col key={user._id}>
                <UserCard
                  user={user} // passo la persona alla card
                  isSelf={user._id === currentUser._id} // io non mi elimino
                  onEdit={openEditForm} // apro il modulo
                  onDelete={setUserToDelete} // chiedo conferma
                />
              </Col>
            ))}
          </Row>
        ) : (
          <UserTable
            users={users}
            currentUserId={currentUser._id} // per spegnere il mio cestino
            onEdit={openEditForm}
            onDelete={setUserToDelete}
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine degli utenti"
        onChange={setPage}
      />

      {/* modale della persona */}
      <FormModal
        show={showForm}
        title={userToEdit ? "Modifica utente" : "Nuovo utente"}
        onClose={() => setShowForm(false)}
      >
        <UserForm
          user={userToEdit} // persona da modificare (null = nuova)
          stores={stores}
          isSelf={userToEdit?._id === currentUser._id} // il mio ruolo non si cambia
          onSaved={handleSaved} // chiudo e ricarico
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* conferma: con la persona spariscono turni e task */}
      <ConfirmDialog
        show={!!userToDelete}
        title="Eliminare l'utente?"
        message={`${userToDelete ? formatFullName(userToDelete) : ""} non potrà più accedere e spariranno anche i suoi turni e le sue task. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting} // spento mentre aspetto il server
        onConfirm={confirmDelete} // elimino la persona
        onCancel={() => setUserToDelete(null)}
      />
    </Container>
  );
};

export default Users;
