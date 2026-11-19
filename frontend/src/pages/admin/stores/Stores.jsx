import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { deleteStore } from "../../../api/stores";

import AddButton from "../../../components/common/addButton/AddButton";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FormModal from "../../../components/common/formModal/FormModal";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import StoreCard from "../../../components/stores/storeCard/StoreCard";
import StoreForm from "../../../components/stores/storeForm/StoreForm";

// pagina Negozi del responsabile: i punti vendita con il loro personale
const Stores = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // modale del modulo: storeToEdit è il negozio da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState(null);
  // conferma dell'eliminazione: il negozio da eliminare, oppure null
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // aumentarlo ricarica la lista (dopo un salvataggio)
  const [refreshCount, setRefreshCount] = useState(0);

  // su telefono "Nuovo negozio" è solo il "+" accanto al titolo
  const isPhone = useIsPhone();

  // i negozi con il loro personale, e di nuovo quando cambia refreshCount
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError).finally(
      () => setIsLoading(false),
    );
  }, [refreshCount]);

  // "Nuovo negozio": modale con il modulo vuoto
  const openNewForm = () => {
    setStoreToEdit(null);
    setShowForm(true);
  };

  // matita sulla card: modale con i dati di quel negozio
  const openEditForm = (store) => {
    setStoreToEdit(store);
    setShowForm(true);
  };

  // dopo il salvataggio chiudo e ricarico: il server rimanda il negozio senza il personale
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e tolgo il negozio dalla lista; finally chiude sempre la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteStore(storeToDelete._id);
      setStores((prevStores) =>
        prevStores.filter((store) => store._id !== storeToDelete._id),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setStoreToDelete(null);
    }
  };

  // "1 punto vendita", "2 punti vendita"
  const storeCountLabel =
    stores.length === 1 ? "punto vendita" : "punti vendita";

  // "Nuovo negozio": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton label="Nuovo negozio" iconOnly={isPhone} onClick={openNewForm} />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Negozi"
        titleAside={isPhone && addButton}
        subtitle={`${stores.length} ${storeCountLabel}`}
        error={error}
      >
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {!isPhone && addButton}
      </PageHeader>

      {isLoading && <Loader />}
      {!isLoading && stores.length === 0 && !error && (
        <Message>Nessun negozio</Message>
      )}

      {/* una colonna su telefono, due da md, tre da xl */}
      <Row
        as="section"
        xs={1}
        md={2}
        xl={3}
        className="g-3"
        aria-label="Punti vendita"
      >
        {stores.map((store) => (
          <Col key={store._id}>
            <StoreCard
              store={store}
              onEdit={openEditForm}
              onDelete={setStoreToDelete}
            />
          </Col>
        ))}
      </Row>

      <FormModal
        show={showForm}
        title={storeToEdit ? "Modifica negozio" : "Nuovo negozio"}
        onClose={() => setShowForm(false)}
      >
        <StoreForm
          store={storeToEdit}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      <ConfirmDialog
        show={!!storeToDelete}
        title="Eliminare il negozio?"
        message={`"${storeToDelete?.name}" verrà eliminato con le sue giacenze. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setStoreToDelete(null)}
      />
    </Container>
  );
};

export default Stores;
