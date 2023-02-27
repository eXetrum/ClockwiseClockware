import React, { useState, useEffect} from 'react';
import {
    Container, Spinner
} from 'react-bootstrap';
import Header from '../Header';
import AdminClientsList from './AdminClientsList';
import ErrorServiceOffline from '../ErrorServiceOffline';

import { deleteClientById, getClients } from '../../api/clients';

import { useSnackbar } from 'notistack';
import { confirm } from 'react-bootstrap-confirmation';

const AdminDashboardClients = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // Initial
	const [clients, setClients] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchClients = async (abortController) => {
        try {
            const response = await getClients(abortController);
            if(response && response.data && response.data.clients) {
                const { clients } = response.data;
                console.log('received clients: ', clients);
                setClients(clients);
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doDeleteClientById = async (id) => {
        try {
            const response = await deleteClientById(id);
            if(response && (response.status === 200 || response.status === 204)) {
                const removedClient = clients.find(item => item.id === id);
                setClients(clients.filter(item => item.id !== id));
                enqueueSnackbar(`Client "${removedClient.email}" removed`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status === 404) {
                setClients(clients.filter(item => item.id !== id));
            }
            
            console.log('doDeleteClientById error: ', e);
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

	// 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
		resetBeforeApiCall();
        fetchClients(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        }
    }, []);

    const handleRemove = async (clientId) => {
        console.log('handleRemove: ', clientId);

        const client = clients.find(item => item.id === clientId);

        const result = await confirm(`Do you want to delete "${client.email}" client ?`, {title: 'Confirm', okText: 'Delete', okButtonStyle: 'danger'});
        if(!result) return;
        resetBeforeApiCall();
        doDeleteClientById(clientId);
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
                <ErrorServiceOffline error={error} pending={pending} />

                <AdminClientsList clients={clients} onRemove={handleRemove} />
                <hr />
			</Container>
		</Container>
    );
};

export default AdminDashboardClients;