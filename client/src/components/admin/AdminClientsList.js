import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

const AdminClientsList = ({ clients, onRemove }) => {
    
    if(clients == null) return null;

    if(clients.length === 0) {
        return (
            <Container>
                <Row className="justify-content-md-center mt-3">
                    <Col md="auto">
                        <Alert>No records yet</Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-2 m-0">id</th>
                        <th className="text-center p-2 m-0">email</th>
                        <th className="text-center p-2 m-0">name</th>                        
                        <th colSpan="2" className="text-center p-2 m-0"></th>
                    </tr>
                </thead>
                <tbody>
                {clients.map(client => 
                    <tr key={client.id} className="m-0">
                        <td className="text-center p-2 m-0">{ client.id }</td>
                        <td className="p-2 m-0">
                            { client.email }
                        </td>
                        <td className="p-2 m-0">
                            { client.name }
                        </td>                        
                        <td className="text-center p-2 m-0">
                            <Link to={"/admin/clients/" + client.id} >
                                <EditIcon />
                            </Link>
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={ () => onRemove(client.id) } />
                            </Link>
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
		</Container>
    );
};

export default AdminClientsList;