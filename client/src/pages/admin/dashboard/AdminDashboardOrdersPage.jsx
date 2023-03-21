import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminOrdersList } from '../../../components';
import { getOrders, deleteOrderById, patchOrderById } from '../../../api';
import { getErrorText } from '../../../utils';
import { ORDER_STATUS } from '../../../constants';

const AdminDashboardOrdersPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPending, setPending] = useState(false);

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

  const doDeleteOrderById = async (id) => {
    setPending(true);
    try {
      await deleteOrderById({ id });
      const removedOrder = orders.find((item) => item.id === id);
      setOrders(orders.filter((item) => item.id !== id));
      enqueueSnackbar(`Order with id=${removedOrder.id} removed`, { variant: 'success' });
    } catch (e) {
      if (e?.response?.status === 404) setOrders(orders.filter((item) => item.id !== id));
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onOrderRemove = async (orderId) => {
    const order = orders.find((item) => item.id === orderId);

    const result = await confirm(`Do you want to delete order with id=${order.id} ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });
    if (result) doDeleteOrderById(orderId);
  };

  const doOrderComplete = async (id) => {
    try {
      const result = await confirm(`Do you want to mark order with id=${id} as completed ?`, {
        title: 'Confirm',
        okText: 'Completed',
        okButtonStyle: 'success',
      });

      if (!result) return;

      setPending(true);
      await patchOrderById({ id, status: ORDER_STATUS.COMPLETED });
      const idx = orders.map((item) => item.id).indexOf(id);
      orders[idx].status = ORDER_STATUS.COMPLETED;
      setOrders(orders);
    } catch (e) {
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doOrderCancel = async (id) => {
    try {
      const result = await confirm(`Do you want to mark order with id=${id} as canceled ?`, {
        title: 'Confirm',
        okText: 'Canceled',
        okButtonStyle: 'success',
      });

      if (!result) return;

      setPending(true);
      await patchOrderById({ id, status: ORDER_STATUS.CANCELED });
      const idx = orders.map((item) => item.id).indexOf(id);
      orders[idx].status = ORDER_STATUS.CANCELED;
      setOrders(orders);
    } catch (e) {
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
          <h1>Admin: Orders</h1>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && (
          <AdminOrdersList
            orders={orders}
            onRemove={onOrderRemove}
            onComplete={doOrderComplete}
            onCancel={doOrderCancel}
            isPending={isPending}
          />
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardOrdersPage;
