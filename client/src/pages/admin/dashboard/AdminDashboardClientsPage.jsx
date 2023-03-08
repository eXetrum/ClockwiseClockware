import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Header from '../../../components/common/Header';
import AdminClientsList from '../../../components/admin/AdminClientsList';
import ModalForm from '../../../components/forms/ModalForm';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { deleteClientById, getClients } from '../../../api/clients';
import { getErrorText } from '../../../utils/error';

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyClient = () => ({ name: '', email: '' });

  const [clients, setClients] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newClient, setNewClient] = useState(initEmptyClient());
  const [pending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(
    () => newClient && newClient?.name?.length >= 3 && newClient.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(newClient.email),
    [newClient],
  );

  const fetchInitialData = async (abortController) => {
    setInitialLoading(true);
    try {
      const response = await getClients({ abortController });
      if (response?.data?.clients) {
        const { clients } = response.data;
        setClients(clients);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doDeleteClientById = async (id) => {
    setPending(true);
    try {
      const response = await deleteClientById({ id });
      if ([200, 204].includes(response?.status)) {
        const removedClient = clients.find((item) => item.id === id);
        setClients(clients.filter((item) => item.id !== id));
        enqueueSnackbar(`Client "${removedClient.email}" removed`, { variant: 'success' });
      }
    } catch (e) {
      if (e?.response?.status === 404) setClients(clients.filter((item) => item.id !== id));
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onClientFormHide = () => {
    setNewClient(initEmptyClient());
    setShowAddForm(false);
  };

  const onClientFormSubmit = (event) => event.preventDefault();
  const onClientNameChange = (event) => setNewClient((prev) => ({ ...prev, name: event.target.value }));
  const onClientEmailChange = (event) => setNewClient((prev) => ({ ...prev, email: event.target.value }));

  const onClientRemove = async (clientId) => {
    const client = clients.find((item) => item.id === clientId);

    const result = await confirm(`Do you want to delete "${client.email}" client ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) doDeleteClientById(clientId);
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Clients Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminClientsList clients={clients} onRemove={onClientRemove} />
          </>
        )}
        <hr />

        <ModalForm
          size="sm"
          show={showAddForm}
          title={'Add New Client'}
          okText={'Create'}
          onHide={onClientFormHide}
          onSubmit={onClientFormSubmit}
          pending={pending}
          isFormValid={isFormValid}
          formContent={
            <>
              <FormGroup>
                <Form.Label>Client email:</Form.Label>
                <FormControl
                  type="text"
                  name="clientEmail"
                  autoFocus
                  onChange={onClientEmailChange}
                  value={newClient.email}
                  disabled={pending}
                />
              </FormGroup>
              <FormGroup>
                <Form.Label>Client name:</Form.Label>
                <FormControl type="text" name="clientName" onChange={onClientNameChange} value={newClient.name} disabled={pending} />
              </FormGroup>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
