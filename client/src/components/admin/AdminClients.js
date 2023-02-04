import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Table, Button, Alert, Spinner
} from 'react-bootstrap';
import StarRating from '../StarRating';
import Header from '../Header';
import { getClients } from '../../api/clients';


const AdminClients = () => {
    
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
                    console.log(clients);
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


	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Clients</h1>
				</center>
                <hr/>
                {(!clients && pending) && <center><Spinner animation="grow" /></center>}
                {clients &&
                <Table>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>name</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                    {clients.map((client, index) => {
                        return (
                        <tr key={"client_id_" + client.id}>
                            <td>{ client.id }</td>
                            <td>{ client.name }</td>
                            <td>{ client.email }</td>
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

export default AdminClients;