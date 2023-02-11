import React, { useState, useEffect} from 'react';
import {
    Container, Spinner
} from 'react-bootstrap';
import Header from '../Header';

import AdminOrdersList from './AdminOrdersList';
import NotificationBox from '../NotificationBox';

import { getOrders, deleteOrderById } from '../../api/orders';


const AdminDashboardOrders = () => {
    
    // Initial
	const [orders, setOrders] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

	// 'componentDidMount'
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getOrders();
                if(response && response.data && response.data.orders) {
                    const { orders } = response.data;
                    setOrders(orders);
                    console.log(orders);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };
        
        setPending(true);
        fetchOrders();
    }, []);

    const handleRemove = (id) => {
        console.log('handleRemove: ', id);
        if (!window.confirm("Delete?")) { return; }

		setPending(true);
        setInfo(null);
        setError(null);

		const doDeleteOrderById = async (id) => {
			try {
				const response = await deleteOrderById(id);
				if (response && response.data && response.data.orders) {                    
                    const { orders } = response.data;
                    setOrders(orders);
                }
			} catch(e) {
				setError(e);
			} finally {
				setPending(false);
			}
		};

        doDeleteOrderById(id);
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
                <AdminOrdersList orders={orders} onRemove={handleRemove} />
                {orders && <hr />}
                <NotificationBox info={info} error={error} pending={pending} />
                {!orders && <hr />}  
			</Container>
		</Container>
    );
};

export default AdminDashboardOrders;