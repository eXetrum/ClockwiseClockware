import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Header from '../Header';
import ErrorContainer from '../ErrorContainer';
import { getClientById, updateClientById } from '../../api/clients';

const AdminEditClient = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [client, setClient] = useState(null);
  const [originalClient, setOriginalClient] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = useMemo(() => client === null && pending, [client, pending]);
  const isError = useMemo(() => error !== null, [error]);
  const isComponentReady = useMemo(() => client !== null, [client]);

  const isFormValid = useCallback(() => client && client?.name?.length >= 3 && /\w{1,}@\w{1,}\.\w{2,}/gi.test(client?.email), [client]);

  const resetBeforeApiCall = () => {
    setPending(true);
    setError(null);
  };

  const fetchClienyById = async (id, abortController) => {
    try {
      const response = await getClientById({ id, abortController });
      if (response?.data?.client) {
        const { client } = response.data;
        setClient(client);
        setOriginalClient(client);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const doUpdateClientById = async (id, client) => {
    try {
      const response = await updateClientById({ id, client });
      if ([200, 204].includes(response?.status)) {
        setClient(client);
        setOriginalClient(client);
        enqueueSnackbar('Cleint updated', { variant: 'success' });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.status === 404) {
        setClient(null);
        setOriginalClient(null);
      } else {
        setClient(originalClient);
      }
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    resetBeforeApiCall();
    fetchClienyById(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    resetBeforeApiCall();
    doUpdateClientById(id, client);
  };

  const onClientEmailChange = (event) => setClient((prev) => ({ ...prev, email: event.target.value }));
  const onClientNameChange = (event) => setClient((prev) => ({ ...prev, name: event.target.value }));

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit client</h1>
          <Link to={'/admin/clients'}>
            <ArrowLeftIcon />
            Back
          </Link>
        </center>
        <hr />

        {isLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        {isError && <ErrorContainer error={error} />}

        {isComponentReady && (
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Form inline="true" className="d-flex align-items-end" onSubmit={onFormSubmit}>
                <FormGroup>
                  <Form.Label>Client email:</Form.Label>
                  <FormControl type="email" name="clientEmail" onChange={onClientEmailChange} value={client.email} disabled={pending} />
                </FormGroup>
                <FormGroup>
                  <Form.Label>Client name:</Form.Label>
                  <FormControl type="text" name="clientName" onChange={onClientNameChange} value={client.name} disabled={pending} />
                </FormGroup>
                <Button className="ms-2" type="submit" variant="success" disabled={!isFormValid()}>
                  Save
                </Button>
              </Form>
            </Col>
          </Row>
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditClient;
