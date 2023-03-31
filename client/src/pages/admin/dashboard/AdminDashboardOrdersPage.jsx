import React, { useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { Header, ErrorContainer, AdminOrdersList } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../store/thunks';
import { selectAllOrders, selectOrderError, selectOrderInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminDashboardOrdersPage = () => {
  const dispatch = useDispatch();

  const orders = useSelector(selectAllOrders);
  const error = useSelector(selectOrderError);
  const isInitialLoading = useSelector(selectOrderInitialLoading);

  useEffect(() => dispatch(fetchOrders()), [dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

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
