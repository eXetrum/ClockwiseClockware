import React, { useEffect, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Header, ErrorContainer, MasterOrdersList } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../store/reducers/ActionCreators';

import { ERROR_TYPE } from '../../../constants';

const MasterDashboardOrdersPage = () => {
  const dispatch = useDispatch();

  const { orders, error, isInitialLoading } = useSelector((state) => state.orderReducer);

  useEffect(() => dispatch(fetchOrders()), [dispatch]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Master: Orders Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <MasterOrdersList orders={orders} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default MasterDashboardOrdersPage;
