import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { getClientById, updateClientById } from '../../api/clients';
import Header from '../Header';
import ErrorBox from '../ErrorBox';

const AdminEditClient = () => {
    const {id} = useParams();
    // Initial
    const [originalClient, setOriginalClient] = useState(null);
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
                    setOriginalClient(client);
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

        setPending(true);
        setClient(null);        
        setInfo(null);
        setError(null);

        const doUpdateClientById = async (id, client) => {
            try {
                const response = await updateClientById(id, client);
                if(response && response.data && response.data.client) {
                    const { client } = response.data;
                    setClient(client);
                    setOriginalClient(client);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
                setClient(originalClient);
            } finally {
                setPending(false);
            }
        }

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
        {client && <hr />}
        <ErrorBox info={info} error={error} pending={pending} />
        {!client && <hr />}          
        </Container>
    </Container>
    );
};

export default AdminEditClient;