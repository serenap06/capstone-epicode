// import
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

// componente Stores: i negozi con il loro personale
const Stores = () => {
  // negozi ed errore
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // modale del modulo: negozio da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState(null);
  // conferma dell'eliminazione
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // aumentarlo ricarica la lista
  const [refreshCount, setRefreshCount] = useState(0);

  // su telefono il "+" accanto al titolo
  const isPhone = useIsPhone();

  // prendo i negozi all'apertura e al refreshCount
  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError).finally(
      () => setIsLoading(false),
    );
  }, [refreshCount]);

  // "Nuovo negozio": modulo vuoto
  const openNewForm = () => {
    setStoreToEdit(null);
    setShowForm(true);
  };

  // matita: modulo con il negozio
  const openEditForm = (store) => {
    setStoreToEdit(store);
    setShowForm(true);
  };

  // salvato: chiudo e ricarico (il server rimanda il negozio senza personale)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino e tolgo il negozio dalla lista; finally chiude la conferma
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

  // "Nuovo negozio": su telefono solo il "+"
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
        {/* da tablet il bottone a destra */}
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
              store={store} // passo il negozio alla card
              onEdit={openEditForm} // apro il modulo
              onDelete={setStoreToDelete} // chiedo conferma
            />
          </Col>
        ))}
      </Row>

      {/* modale del negozio */}
      <FormModal
        show={showForm}
        title={storeToEdit ? "Modifica negozio" : "Nuovo negozio"}
        onClose={() => setShowForm(false)}
      >
        <StoreForm
          store={storeToEdit} // negozio da modificare (null = nuovo)
          onSaved={handleSaved} // chiudo e ricarico
          onCancel={() => setShowForm(false)}
        />
      </FormModal>

      {/* conferma dell'eliminazione */}
      <ConfirmDialog
        show={!!storeToDelete}
        title="Eliminare il negozio?"
        message={`"${storeToDelete?.name}" verrà eliminato con le sue giacenze. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting} // spento mentre aspetto il server
        onConfirm={confirmDelete} // elimino il negozio
        onCancel={() => setStoreToDelete(null)}
      />
    </Container>
  );
};

export default Stores;
