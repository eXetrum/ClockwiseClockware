import React, { useState, useEffect} from 'react';
import { Link }  from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table,  Alert, Badge
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
            <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-2 m-0">id</th>
                        <th className="text-center p-2 m-0">Client</th>
                        <th className="text-center p-2 m-0">Master</th>
                        <th className="text-center p-2 m-0">City/Clock</th>
                        <th className="text-center p-2 m-0">Date</th>                        
                        <th colSpan="2" className="text-center p-2 m-0"></th>
                    </tr>
                </thead>
                <tbody>
                {orders.map((order, index) => {
                    return (
                    <tr key={"order_id_" + order.id} className="m-0">
                        <td className="text-center p-2 m-0 col-1">{ order.id }</td>
                        <td className="text-center p-2 m-0">
                            <p>
                                <a className="text-muted" href={`mailto:${order.client.email}`} target="_blank" rel="noreferrer noopener">
                                    <EmailOutlinedIcon />
                                </a>
                                <span>{`${order.client.name}`}</span>
                            </p>                            
                            <small className="text-muted">
                                { order.client.email }
                            </small>
                        </td>
                        <td className="text-center p-2 m-0">
                            <p>
                                <a className="text-muted" href={`mailto:${order.master.email}`} target="_blank" rel="noreferrer noopener">
                                    <EmailOutlinedIcon />
                                </a>
                                <span>{ order.master.name }</span>
                            </p>
                            <small className="text-muted">
                                {order.master.email}
                            </small>
                            <div className="text-center">
                                <StarRating value={order.master.rating} readonly={true} />
                            </div>
                        </td>
                        <td className="text-center p-2 m-0">
                            <p><Badge className="p-2">{ order.city.name }</Badge></p>
                            <p>
                                <Badge className="p-2" bg="info">{ order.watch.name }
                                    <Badge pill bg="secondary" className="ms-2">{ order.watch.repairTime }h</Badge>
                                </Badge>
                            </p>
                        </td>
                        <td className="text-center p-2 m-0">
                            <small className="text-muted">
                                { formatDate(new Date(order.endDate))} <br/> 
                                { formatDate(new Date(order.startDate)) }
                            </small>
                        </td>

                        <td className="text-center p-2 m-0">
                            {curDate < new Date(order.startDate) &&
                            <Link to={"/admin/orders/" + order.id}>
                                <EditIcon />
                            </Link>
                            }
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={() => { if(onRemove!=null) onRemove(order.id) }} />
                            </Link>
                        </td>
                    </tr>
                    );
                })
                }
                </tbody>
            </Table>
            }
    </>);
};

export default AdminOrdersList;