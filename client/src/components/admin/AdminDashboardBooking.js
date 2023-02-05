import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Table, Button, Alert, Spinner
} from 'react-bootstrap';
import StarRating from '../StarRating';
import Header from '../Header';
import { getOrders, deleteOrderById } from '../../api/booking';


const AdminDashboardBooking = () => {
    
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
					<h1>Admin: Booking</h1>
				</center>
                <hr/>
                {(!orders && pending) && <center><Spinner animation="grow" /></center>}
                {orders && orders.length == 0 && 
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Alert>No records yet</Alert>
                    </Col>
                </Row>
                }
                {orders && orders.length > 0 && 
                <Table striped bordered responsive size="sm" className="mt-3">
                    <thead>
                        <tr>
                            <th className="text-center p-2 m-0">id</th>
                            <th className="text-center p-2 m-0">client name</th>
                            <th className="text-center p-2 m-0">client email</th>
                            <th className="text-center p-2 m-0">master name</th>
                            <th className="text-center p-2 m-0">master email</th>
                            <th className="text-center p-2 m-0">master rating</th>

                            <th className="text-center p-2 m-0">city name</th>
                            <th className="text-center p-2 m-0">watch type name</th>
                            <th className="text-center p-2 m-0">repair_time</th>
                            <th className="text-center p-2 m-0">date start</th>
                            <th className="text-center p-2 m-0">date end</th>
                            <th colSpan="2" className="text-center p-2 m-0"></th>
                        </tr>
                    </thead>
                    <tbody>
                    {orders.map((order, index) => {
                        return (
                        <tr key={"order_id_" + order.id}>
                            <td className="text-center p-2 m-0">{ order.id }</td>
                            <td className="text-center p-2 m-0">{ order.client.name }</td>
                            <td className="text-center p-2 m-0">{ order.client.email }</td>
                            <td className="text-center p-2 m-0">{ order.master.name }</td>
                            <td className="text-center p-2 m-0">{ order.master.email }</td>
                            <td className="text-center p-2 m-0"><StarRating value={order.master.rating} readonly={true} /></td>
                            <td className="text-center p-2 m-0">{ order.city.name }</td>

                            <td className="text-center p-2 m-0">{ order.watch_type.name }</td>
                            <td className="text-center p-2 m-0">{ order.watch_type.repair_time }</td>
                            <td className="text-center p-2 m-0">{ order.watch_type.start_date }</td>
                            <td className="text-center p-2 m-0">{ order.watch_type.end_date }</td>

                            <td className="text-center p-2 m-0">
                                <Link to={"/admin/booking/" + order.id} >
                                    <EditIcon />
                                </Link>
                            </td>
                            <td className="text-center p-2 m-0">
                                <Link to="#">
                                    <DeleteForeverIcon onClick={() => { handleRemove(order.id) }} />
                                </Link>
                            </td>
                        </tr>
                        );
                    })
                    }
                    </tbody>
                </Table>
                }
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        {info && <Alert key='success' variant='success'>{info}</Alert>}
                        {error && <Alert key='danger' variant='danger'>{error.toString()}</Alert>}
                    </Col>
                </Row>
                <hr/>
			</Container>
		</Container>
    );
};

export default AdminDashboardBooking;