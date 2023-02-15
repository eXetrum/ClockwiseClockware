import React, { useState, useEffect} from 'react';
import { Link }  from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table,  Alert, Container, Card, Badge
} from 'react-bootstrap';
import StarRating from '../StarRating';

const AdminOrdersList = ({orders, onRemove=null}) => {
    const formatDate = (date) => {
        const padTo2Digits = (num) => { return num.toString().padStart(2, '0'); };
        return (
            [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
            ].join('-') +
            ' ' +
            [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            ].join(':')
        );
    };

    const [curDate, setCurDate] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurDate(new Date());
        }, 5000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <>
            {orders && orders.length === 0 && 
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No records yet</Alert>
                </Col>
            </Row>
            }
            {orders && orders.length > 0 && 
            <>
                <Row>
                    <Col className="text-center p-2 m-0 col-1"><strong>id</strong></Col>
                    <Col className="text-center p-2 m-0 col-3"><strong>Client</strong></Col>
                    <Col className="text-center p-2 m-0 col-3"><strong>Master</strong></Col>

                    <Col className="text-center p-2 m-0 col-1"><strong>City</strong></Col>
                    
                    <Col className="text-center p-2 m-0 col-1"><strong>Clock</strong></Col>
                    
                    <Col className="text-center p-2 m-0 col-2"><strong>Date</strong></Col>
                    
                    <Col className="text-center p-2 m-0 col-1">&nbsp;</Col>

                </Row>
                {orders.map((order, index) => {
                    return (
                    <div key={"order_id_" + order.id}>
                        <Row>
                            <Col className="text-center p-2 m-0 col-1">{ order.id }</Col>
                            
                            <Col className="text-center p-2 m-0 col-3">
                                <Card>
                                    <Card.Header><Card.Title>{ order.client.name }</Card.Title></Card.Header>
                                    <Card.Body>                                    
                                        <small className="text-muted">
                                            <a className="text-muted" href={`mailto:${order.client.email}`} target="_blank" rel="noreferrer noopener">
                                                <EmailOutlinedIcon />
                                            </a>
                                            { order.client.email }
                                        </small>
                                    </Card.Body>
                                </Card>
                            </Col>
                            
                            <Col className="text-center p-2 m-0 col-3">
                                <Card>
                                    <Card.Header><Card.Title>{ order.master.name }</Card.Title></Card.Header>
                                    <Card.Body>                                    
                                        <small className="text-muted">
                                            <a className="text-muted" href={`mailto:${order.master.email}`} target="_blank" rel="noreferrer noopener">
                                                <EmailOutlinedIcon />
                                            </a>
                                            { order.master.email }
                                        </small>
                                        <StarRating value={order.master.rating} readonly={true} />
                                    </Card.Body>
                                </Card>
                            </Col>
                            
                            <Col className="text-center p-2 m-0 col-1"><Badge className="p-2">{ order.city.name }</Badge></Col>

                            <Col className="text-center p-2 m-0 col-1">
                                <Badge className="p-2" bg="info">{ order.watchType.name }
                                    <Badge pill bg="secondary" className="ms-2">{ order.watchType.repairTime }h</Badge>
                                </Badge>
                            </Col>

                            <Col className="text-center p-2 m-0 col-2">
                                <small className="text-muted">
                                { formatDate(new Date(order.dateTime.startDate))} <br/> { formatDate(new Date(order.dateTime.endDate)) }
                                </small>
                            </Col>

                            <Col className="text-center p-2 m-0 col-1">
                                <Row>
                                    <Col>
                                        {curDate < new Date(order.dateTime.startDate) &&
                                        <Link to={"/admin/orders/" + order.id}>
                                            <EditIcon />
                                        </Link>
                                        }
                                    </Col>
                                    <Col>
                                        <Link to="#">
                                            <DeleteForeverIcon onClick={() => { if(onRemove!=null) onRemove(order.id) }} />
                                        </Link>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <hr/>
                    </div>
                    );
                })
                }
            </>
            }
    </>);
};

export default AdminOrdersList;