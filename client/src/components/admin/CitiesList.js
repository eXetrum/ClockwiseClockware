import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table, Alert
} from 'react-bootstrap';

const CitiesList = ({cities, onRemove=null}) => {
    
    // Initial
	const [_cities, setCities] = useState(null);

	// 'componentDidMount'
    useEffect(() => { setCities(cities); }, [cities]);

	// 'render'
    return (
        <>            
            {_cities && _cities.length === 0 && 
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No records yet</Alert>
                </Col>
            </Row>
            }
            {_cities && _cities.length > 0 &&
            <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-2 m-0">id</th>
                        <th className="text-center p-2 m-0">name</th>
                        <th colSpan="2" className="text-center p-2 m-0"></th>
                    </tr>
                </thead>
                    <tbody>
                {cities.map(( city, index ) => {
                    return (
                    <tr key={index}>
                        <td className="text-center p-2 m-0">{city.id}</td>
                        <td className="p-2 m-0">
                            {city.name}
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to={"/admin/cities/" + city.id} >
                                <EditIcon />
                            </Link>
                        </td>
                        <td className="text-center p-2 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={() => { if(onRemove != null) { onRemove(city.id); } }} />
                            </Link>
                        </td>
                    </tr>
                    );
                })}
                    </tbody>
                </Table>
            }
		</>
    );
};

export default CitiesList;