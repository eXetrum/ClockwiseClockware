import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, ClientForm } from '../../../components';
import { getClientById, updateClientById } from '../../../api';
import { isGlobalError, getErrorText } from '../../../utils';

const initEmptyClient = () => ({ email: '', password: '', name: '' });

const AdminEditClient = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [client, setClient] = useState(initEmptyClient());
  const [originalClient, setOriginalClient] = useState(initEmptyClient());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPending, setPending] = useState(false);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

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
      await updateClientById({ id, client });
      setClient(client);
      setOriginalClient(client);
      enqueueSnackbar('Cleint updated', { variant: 'success' });
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

  const onFormSubmit = event => {
    event.preventDefault();
    doUpdateClientById(id, client);
  };

  const onClientEmailChange = event => setClient(prev => ({ ...prev, email: event.target.value }));
  const onClientNameChange = event => setClient(prev => ({ ...prev, name: event.target.value }));

  const handlers = {
    onFormSubmit,
    onClientEmailChange,
    onClientNameChange,
  };

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

        {isInitialLoading ? (
          <center>
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <ClientForm {...{ isPending, client, ...handlers }} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditClient;
