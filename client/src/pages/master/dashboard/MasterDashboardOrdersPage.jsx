import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, MasterOrdersList } from '../../../components';
import { getOrders, patchOrderById } from '../../../api';
import { ORDER_STATUS } from '../../../constants';
import { isGlobalError, getErrorText } from '../../../utils';

const MasterDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [isPending, setPending] = useState(false);
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

  const doOrderComplete = async (id) => {
    const result = await confirm(`Do you want to mark order with id=${id} as completed ?`, {
      title: 'Confirm',
      okText: 'Completed',
      okButtonStyle: 'success',
    });

    if (!result) return;

    setPending(true);
    try {
      await patchOrderById({
        id,
        status: ORDER_STATUS.COMPLETED,
      });
      const idx = orders.map((item) => item.id).indexOf(id);
      orders[idx].status = ORDER_STATUS.COMPLETED;
      setOrders(orders);
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Master: Orders Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && <MasterOrdersList orders={orders} onComplete={doOrderComplete} isPending={isPending} />}
        <hr />
      </Container>
    </Container>
  );
};

export default MasterDashboardOrdersPage;
