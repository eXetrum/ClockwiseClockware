import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Form, FormGroup, FormControl, Container, Row, Col, Table, Button, Alert, Spinner
} from 'react-bootstrap';
import Header from '../Header';
import { deleteClientById, getClients } from '../../api/clients';


const AdminDashboardClients = () => {
    
    // Initial
	const [clients, setClients] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

	// 'componentDidMount'
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await getClients();
                if(response && response.data && response.data.clients) {
                    const { clients } = response.data;
                    setClients(clients);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };
        
        setPending(true);
        fetchClients();
    }, []);

    const handleRemove = (id) => {
        console.log('handleRemove: ', id);
        if (!window.confirm("Delete?")) { return; }

        const doDeleteClientById = async (id) => {
            try {
                const response = await deleteClientById(id);
                if(response && response.data && response.data.clients) {
                    const { clients } = response.data;
                    setClients(clients);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };
        
        setPending(true);
        doDeleteClientById(id);
    };


	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Clients Dashboard</h1>
				</center>
                <hr/>
                {(!clients && pending) && <center><Spinner animation="grow" /></center>}
                {clients && clients.length == 0 && 
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Alert>No records yet</Alert>
                    </Col>
                </Row>
                }
                {clients && clients.length > 0 &&
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
                                    <DeleteForeverIcon onClick={() => { handleRemove(client.id) }} />
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

export default AdminDashboardClients;