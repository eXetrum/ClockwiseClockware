import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminClientsList, ClientForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchClients, addClient } from '../../../store/thunks';
import { changeVisibilityAddClientForm } from '../../../store/actions';
import { selectAllClients, selectNewClient, selectClientError, selectClientInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const clients = useSelector(selectAllClients);
  const newClient = useSelector(selectNewClient);
  const error = useSelector(selectClientError);
  const isInitialLoading = useSelector(selectClientInitialLoading);

  useEffect(() => dispatch(fetchClients()), [dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(addClient(newClient));
      if (isFulfilled(action)) enqueueSnackbar(`Client "${action.payload.email}" created`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newClient],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddClientForm(true)), [dispatch]);

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
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={onFormShow} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminClientsList clients={clients} />

            <ClientForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Client'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
