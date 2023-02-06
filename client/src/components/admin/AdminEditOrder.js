import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { getOrderById, updateOrderById } from '../../api/orders';
import Header from '../Header';
import StarRating from '../StarRating';
import ErrorBox from '../ErrorBox';

const AdminEditOrder = () => {
    const {id} = useParams();
    // Initial
    const [originalOrder, setOriginalOrder] = useState(null);
    const [order, setOrder] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
    useEffect(() => {
        console.log('"componentDidMount" getOrderById');
        const fetchOrderById = async (id) => {
            try {
                const response = await getOrderById(id)
                if (response && response.data && response.data.order) {
                    const { order } = response.data;
                    setOrder(order);
                    setOriginalOrder(order);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchOrderById(id);
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();

        setPending(true);
        setOrder(null);        
        setInfo(null);
        setError(null);

        const doUpdateOrderById = async (id, order) => {
            try {
                const response = await updateOrderById(id, order);
                if(response && response.data && response.data.order) {
                    const { order } = response.data;
                    setOrder(order);
                    setOriginalOrder(order);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
                setOrder(originalOrder);
            } finally {
                setPending(false);
            }
        }

        doUpdateOrderById(id, order);
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit order</h1>
                <Link to={"/admin/orders"} ><ArrowLeftIcon/>Back</Link>
            </center>
            <hr/>
            {(!order && pending) && <center><Spinner animation="grow" /> </center>}
            {order  &&
            <Row key={"order_id_" + order.id}>
                    <Col className="text-center p-2 m-0">{ order.id }</Col>
                    <Col className="text-center p-2 m-0">{ order.client.name }</Col>
                    <Col className="text-center p-2 m-0">{ order.client.email }</Col>
                    <Col className="text-center p-2 m-0">{ order.master.name }</Col>
                    <Col className="text-center p-2 m-0">{ order.master.email }</Col>
                    <Col className="text-center p-2 m-0"><StarRating value={order.master.rating} readonly={true} /></Col>
                    <Col className="text-center p-2 m-0">{ order.city.name }</Col>

                    <Col className="text-center p-2 m-0">{ order.watch_type.name }</Col>
                    <Col className="text-center p-2 m-0">{ order.watch_type.repair_time }</Col>
                    <Col className="text-center p-2 m-0">{ order.watch_type.start_date }</Col>
                    <Col className="text-center p-2 m-0">{ order.watch_type.end_date }</Col>
            </Row>
            }
            
        {order && <hr />}
        <ErrorBox info={info} error={error} pending={pending} />
        {!order && <hr />}          
        </Container>
    </Container>
    );
};

export default AdminEditOrder;