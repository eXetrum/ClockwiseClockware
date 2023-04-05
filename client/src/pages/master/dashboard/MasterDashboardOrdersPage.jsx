import React, { useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { Header, ErrorContainer, MasterOrdersList } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../../store/thunks';
import { selectOrderError, selectOrderInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const MasterDashboardOrdersPage = () => {
  const dispatch = useDispatch();

  const error = useSelector(selectOrderError);
  const isInitialLoading = useSelector(selectOrderInitialLoading);

  useEffect(() => dispatch(fetchOrders()), [dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

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
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <MasterOrdersList /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default MasterDashboardOrdersPage;
