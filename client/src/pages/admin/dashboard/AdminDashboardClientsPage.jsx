import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminClientsList, ModalForm } from '../../../components';
import { createClient, deleteClientById, getClients, resetPassword, resendEmailConfirmation } from '../../../api';
import { getErrorText, validateEmail } from '../../../utils';

const initEmptyClient = () => ({ email: '', password: '', name: '' });

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [clients, setClients] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newClient, setNewClient] = useState(initEmptyClient());
  const [isPending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(
    () => newClient && newClient?.name?.length >= 3 && newClient.email && validateEmail(newClient.email) && newClient.password,
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
      await deleteClientById({ id });
      const removedClient = clients.find((item) => item.id === id);
      setClients(clients.filter((item) => item.id !== id));
      enqueueSnackbar(`Client "${removedClient.email}" removed`, { variant: 'success' });
    } catch (e) {
      if (e?.response?.status === 404) setClients(clients.filter((item) => item.id !== id));
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doResetPassword = async (client) => {
    try {
      setPending(true);
      await resetPassword({ userId: client.id });
      enqueueSnackbar(`Password for ${client.email} has been successfully reset`, { variant: 'success' });
    } catch (e) {
      if (e?.response?.status === 404) setClients(clients.filter((item) => item.id !== client.id));
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doResendEmailConfirmation = async (client) => {
    try {
      setPending(true);
      await resendEmailConfirmation({ userId: client.id });
      enqueueSnackbar(`Email confirmation for client ${client.email} has been sent`, { variant: 'success' });
    } catch (e) {
      if (e?.response?.status === 404) setClients(clients.filter((item) => item.id !== client.id));
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

  const onClientRemove = async (clientId) => {
    const client = clients.find((item) => item.id === clientId);

    const result = await confirm(`Do you want to delete "${client.email}" client ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) doDeleteClientById(clientId);
  };

  const onClientResetPassword = async (client) => doResetPassword(client);
  const onClientResendEmailConfirmation = async (client) => doResendEmailConfirmation(client);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Clients Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminClientsList
              clients={clients}
              onRemove={onClientRemove}
              onResetPassword={onClientResetPassword}
              onResendEmailConfirmation={onClientResendEmailConfirmation}
              isPending={isPending}
            />
          </>
        ) : null}
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
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
