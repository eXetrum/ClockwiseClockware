import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table, Alert
} from 'react-bootstrap';

const AdminClientsList = ({clients, onRemove=null}) => {
    
    // Initial
	const [_clients, setClients] = useState(null);

	// 'componentDidMount'
    useEffect(() => { setClients(clients); }, [clients]);

	// 'render'
    return (
        <>            
            {_clients && _clients.length === 0 && 
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No records yet</Alert>
                </Col>
            </Row>
            }
            {_clients && _clients.length > 0 &&
            <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-2 m-0">id</th>
                        <th className="text-center p-2 m-0">name</th>
                        <th className="text-center p-2 m-0">email</th>
                        <th colSpan="2" className="text-center p-2 m-0"></th>
                    </tr>
                </thead>
                <tbody>
                {clients.map((client, index) => {
                    return (
                    <tr key={"client_id_" + client.id} className="m-0">
                        <td className="text-center p-2 m-0">{ client.id }</td>
                        <td className="p-2 m-0">
                            { client.name }
                        </td>
                        <td className="p-2 m-0">
                            { client.email }
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to={"/admin/clients/" + client.id} >
                                <EditIcon />
                            </Link>
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={() => { 
                                    if(onRemove != null) { onRemove(client.id); }
                                }} />
                            </Link>
                        </td>
                    </tr>
                    );
                })
                }
                </tbody>
            </Table>
            }
		</>
    );
};

export default AdminClientsList;