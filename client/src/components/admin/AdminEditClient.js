import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Header from '../Header';
import ErrorServiceOffline from '../ErrorServiceOffline';
import ErrorNotFound from '../ErrorNotFound';

import { getClientById, updateClientById } from '../../api/clients';
import { useSnackbar } from 'notistack';

const AdminEditClient = () => {
    const {id} = useParams();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // Initial
    const [client, setClient] = useState(null);
    const [originalClient, setOriginalClient] = useState(null);    
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchClienyById = async (id, abortController) => {
        try {
            const response = await getClientById(id, abortController)
            if (response && response.data && response.data.client) {
                const { client } = response.data;
                setClient(client);
                setOriginalClient(client);
            }
        } catch (e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doUpdateClientById = async (id, client) => {
        try {
            const response = await updateClientById(id, client);
            if(response && (response.status === 200 || response.status === 204)) {
                //const { client } = response.data;
                setClient(client);
                setOriginalClient(client);
                enqueueSnackbar(`Cleint updated`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status && e.response.status === 404) {
                setClient(null);
                setOriginalClient(null);
            } else {
                setClient(originalClient);
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };
    // 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" getClientById');
        
        resetBeforeApiCall();
        fetchClienyById(id, abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();
        resetBeforeApiCall();
        doUpdateClientById(id, client);
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit client</h1>
                <Link to={"/admin/clients"} ><ArrowLeftIcon/>Back</Link>
            </center>
            <hr/>
            {(!client && pending) && <center><Spinner animation="grow" /> </center>}

            <ErrorServiceOffline error={error} pending={pending} />
            <ErrorNotFound error={error} pending={pending} />

            {client  &&
            <Row className="justify-content-md-center">
                <Col md="auto">
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
                                    setError(null);
                                }}
                            />
                        </FormGroup>
                        <Button className="ms-2" type="submit" variant="success" disabled={!client.name || !client.email || pending}>Save</Button>
                    </Form>
                </Col>
            </Row>
            }
            <hr />
        </Container>
    </Container>
    );
};

export default AdminEditClient;