import React from 'react';
import { Link }  from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import {
    Row, Col, Table, Badge, Alert
} from 'react-bootstrap';
import StarRating from '../StarRating';

const AdminMastersList = ({masters, onRemove=null}) => {
    return (
        <> 
            {masters && masters.length === 0 && 
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No records yet</Alert>
                </Col>
            </Row>
            }
            {masters && masters.length > 0 &&
            <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-3 m-0">id</th>
                        <th className="text-center p-3 m-0">name</th>
                        <th className="text-center p-3 m-0">email</th>
                        <th className="text-center p-3 m-0">cities</th>
                        <th className="text-center p-3 m-0">rating</th>
                        <th colSpan="2" className="text-center p-3 m-0"></th>
                    </tr>
                </thead>
                <tbody>
                {masters.map(( master, index ) => {
                    return (
                    <tr key={"master_id_" + index}>
                        <td className="text-center p-3 m-0">
                            {master.id}
                        </td>
                        <td className="p-3 m-0">
                            {master.name}
                        </td>
                        <td className="p-3 m-0">
                            {master.email}
                        </td>
                        <td className="pt-2 m-0">
                        {master.cities && master.cities.map((city, index2) => {
                            return <Badge bg="info" className="p-2 m-1" key={index + "_" + index2}>{city.name}</Badge>
                        })}

                        </td>
                        <td className="text-center p-2 m-0">
                            <StarRating
                                total={5}
                                value={master.rating}
                                readonly={true}
                            />
                        </td>
                        <td className="text-center p-3 m-0">
                            <Link to={"/admin/masters/" + master.id} >
                                <EditIcon />
                            </Link>
                        </td>
                        <td className="text-center p-3 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={() => { if(onRemove != null) onRemove(master.id) }} />
                            </Link>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </Table>
            }
    </>);
};

export default AdminMastersList;