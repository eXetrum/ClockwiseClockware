import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import Header from '../Header';
import AdminOrdersList from './AdminOrdersList';
import ErrorContainer from '../ErrorContainer';
import { getOrders, deleteOrderById } from '../../api/orders';

const AdminDashboardOrders = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [orders, setOrders] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const isLoading = useMemo(() => orders === null && pending, [orders, pending]);
    const isError = useMemo(() => error !== null, [error]);
    const isComponentReady = useMemo(() => orders !== null, [orders]);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchOrders = async (abortController) => {
        try {
            const response = await getOrders({ abortController });
            if(response?.data?.orders) {
                const { orders } = response.data;
                setOrders(orders);
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doDeleteOrderById = async (id) => {
        try {
            const response = await deleteOrderById({ id });
            if ([200, 204].includes(response?.status)) {
                const removedOrder = orders.find(item => item.id === id);            
                setOrders(orders.filter(item => item.id !== id));
                enqueueSnackbar(`Order with id=${removedOrder.id} removed`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e?.response?.status === 404) {
                setOrders(orders.filter(item => item.id !== id));
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        setPending(true);
        fetchOrders(abortController);
        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [closeSnackbar]);

    const onOrderRemove = async(orderId) => {
        const order = orders.find(item => item.id === orderId);

        const result = await confirm(`Do you want to delete order with id=${order.id} ?`, {title: 'Confirm', okText: 'Delete', okButtonStyle: 'danger'});
        if(!result) return;

		resetBeforeApiCall()
        doDeleteOrderById(orderId);
    };

    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Orders</h1>
				</center>
                <hr/>

                {isLoading && <center><Spinner animation="grow" /></center>}
                
                {isError && <ErrorContainer error={error} />}

                {isComponentReady && <AdminOrdersList orders={orders} onRemove={onOrderRemove} />}                
                <hr />
                
			</Container>
		</Container>
    );
};

export default AdminDashboardOrders;