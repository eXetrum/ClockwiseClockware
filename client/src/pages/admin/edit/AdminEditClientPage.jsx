import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Header from '../../../components/common/Header';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { getClientById, updateClientById } from '../../../api/clients';
import { isGlobalError, getErrorText } from '../../../utils';

const AdminEditClient = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyClient = () => ({ name: '', email: '' });

  const [client, setClient] = useState(initEmptyClient());
  const [originalClient, setOriginalClient] = useState(initEmptyClient());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pending, setPending] = useState(false);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(() => client.name.length >= 3 && /\w{1,}@\w{1,}\.\w{2,}/gi.test(client.email), [client]);

  const fetchClienyById = async (id, abortController) => {
    setInitialLoading(true);
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
      setInitialLoading(false);
    }
  };

  const doUpdateClientById = async (id, client) => {
    setPending(true);
    try {
      const response = await updateClientById({ id, client });
      if ([200, 204].includes(response?.status)) {
        setClient(client);
        setOriginalClient(client);
        enqueueSnackbar('Cleint updated', { variant: 'success' });
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      setClient(originalClient);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchClienyById(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
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

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && (
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Form inline="true" className="d-flex align-items-end" onSubmit={onFormSubmit}>
                <Form.Group>
                  <Form.Label>Client email:</Form.Label>
                  <Form.Control type="email" name="clientEmail" onChange={onClientEmailChange} value={client.email} disabled={pending} />
                </Form.Group>
                <Form.Group className="ms-2">
                  <Form.Label>Client name:</Form.Label>
                  <Form.Control type="text" name="clientName" onChange={onClientNameChange} value={client.name} disabled={pending} />
                </Form.Group>
                <Button className="ms-2" type="submit" variant="success" disabled={pending || !isFormValid()}>
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
