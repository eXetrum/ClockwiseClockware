import React, { useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminOrdersList } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../store/reducers/ActionCreators';
import { orderSlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { clearNotification } = orderSlice.actions;
  const { orders, error, notification, isInitialLoading } = useSelector((state) => state.orderReducer);

  useEffect(() => {
    dispatch(fetchOrders());
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

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Orders</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <AdminOrdersList orders={orders} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardOrdersPage;
