import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Plus } from "lucide-react";

import { loadData } from "../../../api/loadData";
import { deleteStore } from "../../../api/stores";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

import Button from "../../../components/common/button/Button";
import ConfirmDialog from "../../../components/common/confirmDialog/ConfirmDialog";
import FormModal from "../../../components/common/formModal/FormModal";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import StoreCard from "../../../components/stores/storeCard/StoreCard";
import StoreForm from "../../../components/stores/storeForm/StoreForm";

// pagina Negozi del responsabile: i punti vendita con il loro personale
const Stores = () => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  // modale del modulo: storeToEdit è il negozio da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState(null);
  // conferma dell'eliminazione: il negozio da eliminare, oppure null
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // su telefono "Nuovo negozio" è solo il "+" accanto al titolo
  const isPhone = useMediaQuery("(max-width: 767.98px)");
  // aumentarlo ricarica la lista
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    loadData("/stores", (data) => setStores(data.stores), setError);
  }, [refreshCount]);

  const openNewForm = () => {
    setStoreToEdit(null);
    setShowForm(true);
  };

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
  const storeCountLabel = stores.length === 1 ? "punto vendita" : "punti vendita";

  // "Nuovo negozio": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <Button
      aria-label="Nuovo negozio"
      className={isPhone ? "app-button-icon" : ""}
      onClick={openNewForm}
    >
      <Plus size={18} aria-hidden="true" />
      {!isPhone && "Nuovo negozio"}
    </Button>
  );

  return (
    <Container fluid>
      <PageHeader
        title="Negozi"
        titleAside={isPhone && addButton}
        subtitle={`${stores.length} ${storeCountLabel}`}
        error={error}
      >
        {!isPhone && addButton}
      </PageHeader>

      {stores.length === 0 && !error && <Message>Nessun negozio</Message>}

      {/* una colonna su telefono, due da md, tre da xl */}
      <Row
        as="section"
        xs={1}
        md={2}
        xl={3}
        className="g-4"
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
        message={`"${storeToDelete?.name}" verrà eliminato. Non si può annullare.`}
        confirmLabel="Elimina"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setStoreToDelete(null)}
      />
    </Container>
  );
};

export default Stores;
