import React, { useState, useEffect} from 'react';
import { Link }  from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table,  Alert
} from 'react-bootstrap';
import StarRating from '../StarRating';

const AdminOrdersList = ({orders, onRemove=null}) => {
    
    // Initial
	const [_orders, setOrders] = useState(null);
    useEffect(() => { setOrders(orders); }, [orders]);

    return (
        <>
            {_orders && _orders.length === 0 && 
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No records yet</Alert>
                </Col>
            </Row>
            }
            {_orders && _orders.length > 0 && 
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
                {_orders && _orders.map((order, index) => {
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
                            <Link to={"/admin/orders/" + order.id} >
                                <EditIcon />
                            </Link>
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