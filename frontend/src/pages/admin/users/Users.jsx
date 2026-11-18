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

// pagina Utenti del responsabile: le persone in ordine di cognome, 10 alla volta
// (ordine e pagine li fa il server)
const Users = () => {
  // currentUser: chi è collegato; setUser per aggiornare la barra in alto se modifico me stessa
  const { user: currentUser, setUser } = useAuth();
  // una pagina di persone, quante sono in tutto e quante pagine ci sono
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // i negozi, per il menu del modulo
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // aumentarlo ricarica la lista (dopo un salvataggio)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: userToEdit è la persona da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  // conferma dell'eliminazione: la persona da eliminare, oppure null
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono il "+" accanto al titolo
  const isPhone = useIsPhone();
  // fino a 1366px le card (una colonna su telefono, due da tablet in su), sopra la tabella,
  // come in tutte le pagine con una tabella
  const showCards = useShowCards();

  // una pagina di persone: a ogni cambio di pagina e dopo ogni salvataggio
  useEffect(() => {
    loadData(
      `/users?${toQuery({ page, limit: PAGE_SIZE })}`,
      (data) => {
        setUsers(data.users);
        setTotalCount(data.totals.count);
        setTotalPages(data.pagination.totalPages);
        // dopo un'eliminazione l'ultima pagina può sparire: torno all'ultima che c'è
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

  // i negozi una volta sola
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, []);

  // "Nuovo utente": modale con il modulo vuoto
  const openNewForm = () => {
    setUserToEdit(null);
    setShowForm(true);
  };

  // matita sulla card o nella tabella: modale con i dati di quella persona
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

  // elimino sul server e ricarico (la pagina si riempie con la persona successiva);
  // finally chiude sempre la conferma
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

  // "Nuovo utente": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
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
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {!isPhone && addButton}
      </PageHeader>

      {isLoading && <Loader />}
      {!isLoading && users.length === 0 && !error && (
        <Message>Nessun utente</Message>
      )}

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

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={page}
        totalPages={totalPages}
        label="Pagine degli utenti"
        onChange={setPage}
      />

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
