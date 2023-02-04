import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Table, Button, Alert, Spinner
} from 'react-bootstrap';
import StarRating from '../StarRating';
import Header from '../Header';
import { getOrders } from '../../api/booking';


const AdminBooking = () => {
    
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
                <Table>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>client_id</th>
                            <th>client name</th>
                            <th>client email</th>
                            <th>master_id</th>
                            <th>master name</th>
                            <th>master email</th>
                            <th>master rating</th>
                            <th>cities</th>

                            <th>city_id</th>
                            <th>city name</th>
                            <th>watch_type_id</th>
                            <th>watch type name</th>
                            <th>repair_time</th>
                            <th>date start</th>
                            <th>date end</th>
                        </tr>
                    </thead>
                    <tbody>
                    {orders.map((order, index) => {
                        return (
                        <tr key={"order_id_" + order.id}>
                            <td>{ order.id }</td>
                            <td>{ order.client_id }</td>
                            <td>{ order.client.name }</td>
                            <td>{ order.client.email }</td>
                            <td>{ order.master_id }</td>
                            <td>{ order.master.name }</td>
                            <td>{ order.master.email }</td>
                            <td><StarRating value={order.master.rating} readonly={true} /></td>
                            <td>{ "cities" }</td>
                            <td>{ order.city_id }</td>
                            <td>{ order.city.name }</td>

                            <td>{ order.watch_type_id }</td>
                            <td>{ order.watch_type.name }</td>
                            <td>{ order.watch_type.repair_time }</td>
                            <td>{ order.watch_type.start_date }</td>
                            <td>{ order.watch_type.end_date }</td>
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

export default AdminBooking;