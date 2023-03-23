import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, ClientForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchClient, updateClient } from '../../../store/reducers/ActionCreators';
import { clientSlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminEditClient = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { clearNotification } = clientSlice.actions;
  const { newClient, error, notification, isInitialLoading } = useSelector((state) => state.clientReducer);

  useEffect(() => {
    dispatch(fetchClient(id));
  }, [id, dispatch]);

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
    dispatch(updateClient(newClient));
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
