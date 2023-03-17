import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Header, ErrorContainer, ClientOrdersList } from '../../../components';
import { getOrders } from '../../../api';

const ClientDashboardOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const fetchInitialData = async (abortController) => {
    setInitialLoading(true);
    try {
      const response = await getOrders({ abortController });
      if (response?.data?.orders) {
        const { orders } = response.data;
        setOrders(orders);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Client: Orders Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && <ClientOrdersList orders={orders} />}
        <hr />
      </Container>
    </Container>
  );
};

export default ClientDashboardOrdersPage;
