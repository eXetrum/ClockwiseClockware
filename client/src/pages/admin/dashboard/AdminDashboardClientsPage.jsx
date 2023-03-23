import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminClientsList, ClientForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchClients, addClient, deleteClient } from '../../../store/reducers/ActionCreators';
import { clientSlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, clearNotification } = clientSlice.actions;
  const { clients, newClient, error, notification, isInitialLoading } = useSelector((state) => state.clientReducer);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (notification.text && notification.variant) {
      enqueueSnackbar(notification.text, { variant: notification.variant });
      dispatch(clearNotification());
    }
  }, [notification, enqueueSnackbar, dispatch, clearNotification]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = (event) => {
    event.preventDefault();
    dispatch(addClient(newClient));
  };

  const onClientRemove = async (clientId) => {
    const client = clients.find((item) => item.id === clientId);

    const result = await confirm(`Do you want to delete "${client.email}" client ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(deleteClient(clientId));
  };

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
                  <AddCircleOutlineOutlinedIcon onClick={() => dispatch(changeVisibilityAddForm(true))} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminClientsList clients={clients} onRemove={onClientRemove} />

            <ClientForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Client'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
