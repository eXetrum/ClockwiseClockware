import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminClientsList, ModalForm } from '../../../components';
import { createClient, deleteClientById, getClients } from '../../../api';
import { getErrorText } from '../../../utils';

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyClient = () => ({ email: '', password: '', name: '', isActive: false });

  const [clients, setClients] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newClient, setNewClient] = useState(initEmptyClient());
  const [isPending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(
    () =>
      newClient && newClient?.name?.length >= 3 && newClient.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(newClient.email) && newClient.password,
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

  const doCreateClient = async (client) => {
    setPending(true);
    try {
      const response = await createClient({ client });
      if (response?.data?.client) {
        const { client } = response.data;
        setClients([client, ...clients]);
        setNewClient(initEmptyClient());
        setShowAddForm(false);
        enqueueSnackbar(`Client "${client.email}" created`, { variant: 'success' });
      }
    } catch (e) {
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
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

  const onClientFormSubmit = (event) => {
    event.preventDefault();
    doCreateClient(newClient);
  };
  const onClientEmailChange = (event) => setNewClient((prev) => ({ ...prev, email: event.target.value }));
  const onClientNameChange = (event) => setNewClient((prev) => ({ ...prev, name: event.target.value }));
  const onClientPasswordChange = (event) => setNewClient((prev) => ({ ...prev, password: event.target.value }));
  const onClientIsActiveChange = (event) => setNewClient((prev) => ({ ...prev, isActive: event.target.checked }));

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
          pending={isPending}
          isFormValid={isFormValid}
          formContent={
            <>
              <FormGroup className="mb-3">
                <Form.Label>Email:</Form.Label>
                <FormControl
                  type="text"
                  name="clientEmail"
                  autoFocus
                  onChange={onClientEmailChange}
                  value={newClient.email}
                  disabled={isPending}
                />
              </FormGroup>
              <FormGroup className="mb-3">
                <Form.Label>Name:</Form.Label>
                <FormControl type="text" name="clientName" onChange={onClientNameChange} value={newClient.name} disabled={isPending} />
              </FormGroup>
              <FormGroup className="mb-3">
                <Form.Label>Password:</Form.Label>
                <FormControl
                  type="password"
                  name="clientPassword"
                  onChange={onClientPasswordChange}
                  value={newClient.password}
                  disabled={isPending}
                />
              </FormGroup>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="clientIsActive"
                  id="clientIsActiveSwitch"
                  checked={newClient.isActive}
                  onChange={onClientIsActiveChange}
                  disabled={isPending}
                  label="IsActive"
                />
              </Form.Group>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
