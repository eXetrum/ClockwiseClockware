import React, { useState, useEffect} from 'react';
import {
    Container, Spinner
} from 'react-bootstrap';
import Header from '../Header';
import AdminClientsList from './AdminClientsList';
import NotificationBox from '../NotificationBox';
import { deleteClientById, getClients } from '../../api/clients';

const AdminDashboardClients = () => {

    // Initial
	const [clients, setClients] = useState(null);
    const [pending, setPending] = useState(true);
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
        setError(null);
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
        setError(null);
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
                <AdminClientsList clients={clients} onRemove={handleRemove} />

                {clients && <hr />}
                <NotificationBox error={error} pending={pending} />
                {!clients && <hr />} 
			</Container>
		</Container>
    );
};

export default AdminDashboardClients;