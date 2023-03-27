import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { formatDecimal } from '../../utils';

const AdminCitiesList = ({ cities, onRemove }) => {
  if (cities.length === 0) {
    return (
      <Container>
        <Row className="justify-content-md-center mt-3">
          <Col md="auto">
            <Alert variant="warning">No records yet</Alert>
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
            <th className="text-center p-2 m-0">name</th>
            <th className="text-center p-2 m-0">pricePerHour</th>
            <th colSpan="2" className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id}>
              <td className="text-center p-2 m-0 col-2">{city.id}</td>
              <td className="text-center p-2 m-0">{city.name}</td>
              <th className="text-center p-2 m-0 col-1">{formatDecimal(city.pricePerHour)}</th>
              <td className="text-center p-2 m-0 col-1">
                <Link to={'/admin/cities/' + city.id}>
                  <EditIcon />
                </Link>
              </td>
              <td className="text-center p-2 m-0 col-1">
                <Link to="#">
                  <DeleteForeverIcon onClick={() => onRemove(city.id)} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminCitiesList;
