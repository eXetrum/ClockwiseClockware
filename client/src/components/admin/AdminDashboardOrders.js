import React, { useState, useEffect} from 'react';
import {
    Container, Spinner
} from 'react-bootstrap';
import Header from '../Header';

import AdminOrdersList from './AdminOrdersList';
import ErrorServiceOffline from '../ErrorServiceOffline';

import { getOrders, deleteOrderById } from '../../api/orders';

import { useSnackbar } from 'notistack';
import { confirm } from 'react-bootstrap-confirmation';

const AdminDashboardOrders = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // Initial
	const [orders, setOrders] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchOrders = async (abortController) => {
        try {
            const response = await getOrders(abortController);
            if(response && response.data && response.data.orders) {
                let { orders } = response.data;
                console.log(orders);
                orders.map(item => {
                    item.dateTime.startDate = new Date(item.dateTime.startDate);
                    item.dateTime.endDate = new Date(item.dateTime.endDate);
                    return item;
                });
                setOrders(orders);
                console.log(orders);
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doDeleteOrderById = async (id) => {
        try {
            const response = await deleteOrderById(id);
            if (response && (response.status == 200 || response.status == 204)) {     
                const removedOrder = orders.find(item => item.id == id);            
                setOrders(orders.filter(item => item.id != id));
                enqueueSnackbar(`Order with id=${removedOrder.id} removed`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status == 404) {
                setOrders(orders.filter(item => item.id != id));
            }
            console.log('doDeleteOrderById error: ', e);
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

	// 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchOrders()');
        setPending(true);
        fetchOrders(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    const handleRemove = async(orderId) => {
        console.log('handleRemove: ', orderId);

        const order = orders.find(item => item.id == orderId);

        const result = await confirm(`Do you want to delete order with id=${order.id} ?`, {title: 'Confirm', okText: 'Delete', okButtonStyle: 'danger'});
        if(!result) return;

		resetBeforeApiCall()
        doDeleteOrderById(orderId);
    };


	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Orders</h1>
				</center>
                <hr/>
                {(!orders && pending) && <center><Spinner animation="grow" /></center>}

                <ErrorServiceOffline error={error} pending={pending} />

                <AdminOrdersList orders={orders} onRemove={handleRemove} />
                <hr />
			</Container>
		</Container>
    );
};

export default AdminDashboardOrders;