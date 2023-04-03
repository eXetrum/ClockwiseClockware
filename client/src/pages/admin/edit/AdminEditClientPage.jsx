import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, ClientForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClient, updateClient } from '../../../store/thunks';
import { selectNewClient, selectClientError, selectClientInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminEditClient = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const newClient = useSelector(selectNewClient);
  const error = useSelector(selectClientError);
  const isInitialLoading = useSelector(selectClientInitialLoading);

  useEffect(() => dispatch(fetchClient(id)), [id, dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(updateClient(newClient));
      if (isFulfilled(action)) enqueueSnackbar('Client updated', { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newClient],
  );

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
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <ClientForm onSubmit={onFormSubmit} isHidePassword={true} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditClient;
