import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Alert, Spinner
} from 'react-bootstrap';

import { getClientById, updateClientById } from '../../api/clients';
import Header from '../Header';

const AdminEditClient = () => {
    const {id} = useParams();
    // Initial
    const [client, setClient] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
    useEffect(() => {
        console.log('"componentDidMount" getClientById');
        const fetchClienyById = async (id) => {
            try {
                const response = await getClientById(id)
                if (response && response.data && response.data.client) {
                    const { client } = response.data;
                    setClient(client);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchClienyById(id);
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();

        const doUpdateClientById = async (id, client) => {
            try {
                const response = await updateClientById(id, client);
                if(response && response.data && response.data.client) {
                    const { client } = response.data;
                    setClient(client);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }

        doUpdateClientById(id, client);
        setClient(null);
        setPending(true);
        setInfo(null);
        setError(null);

    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit client</h1>
            </center>
            <hr/>
            {!client && <center><Spinner animation="grow" /> </center>}
            {client  &&
            <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                <FormGroup>
                    <Form.Label>Client name:</Form.Label>
                    <FormControl type="text" name="clientName" 
                        disabled={pending}
                        value={client.name}
                        onChange={(event) => {
                            setClient((prev) => ({
                                ...prev,
                                name: event.target.value
                            }));
                            setInfo(null);
                            setError(null);
                        }}
                    />
                </FormGroup>
                <FormGroup>
                    <Form.Label>Client email:</Form.Label>
                    <FormControl type="email" name="clientEmail" 
                        disabled={pending}
                        value={client.email}
                        onChange={(event) => {
                            setClient((prev) => ({
                                ...prev,
                                email: event.target.value
                            }));
                            setInfo(null);
                            setError(null);
                        }}
                    />
                </FormGroup>
                <Button className="ms-2" type="submit" variant="success" disabled={!client.name || !client.email || pending}>Save</Button>
            </Form>
            }
        <hr/>
        <Row className="justify-content-md-center">
            <Col md="auto">
                {info && <Alert key='success' variant='success'>{info}</Alert>}
                {error && <Alert key='danger' variant='danger'>{error.toString()}</Alert>}
            </Col>
        </Row>
        </Container>
    </Container>
    );
};

export default AdminEditClient;