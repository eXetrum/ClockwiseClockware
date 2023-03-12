import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, Badge } from 'react-bootstrap';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ViewMasterCard from '../master/ViewMasterCard';
import StarRating from '../common/StarRating';

const MasterTableList = ({ masters, onRemove }) => {
  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th className="text-center p-3 m-0">id</th>
            <th className="text-center p-3 m-0">email</th>
            <th className="text-center p-3 m-0">name</th>
            <th className="text-center p-3 m-0">cities</th>
            <th className="text-center p-3 m-0">rating</th>
            <th colSpan="2" className="text-center p-3 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {masters.map((master) => (
            <tr key={master.id}>
              <td className="text-center p-3 m-0">{master.id}</td>
              <td className="p-3 m-0">{master.email}</td>
              <td className="p-3 m-0">{master.name}</td>
              <td className="text-center  pt-2 m-0">
                {master.cities.map((city) => (
                  <Badge bg="info" className="p-2 m-1" key={city.id}>
                    {city.name}
                  </Badge>
                ))}
              </td>
              <td className="text-center p-2 m-0">
                <StarRating total={5} value={master.rating} readonly={true} />
              </td>
              <>
                <td className="text-center p-3 m-0">
                  <Link to={'/admin/masters/' + master.id}>
                    <EditIcon />
                  </Link>
                </td>
                <td className="text-center p-3 m-0">
                  <Link to="#">
                    <DeleteForeverIcon onClick={() => onRemove(master.id)} />
                  </Link>
                </td>
              </>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

const MasterCardList = ({ masters, onSelect }) => {
  return (
    <Container>
      <Row className="justify-content-md-center mt-4">
        <>
          {masters.map((master) => (
            <Col key={master.id} md="auto" onClick={() => onSelect(master)}>
              <ViewMasterCard master={master} />
            </Col>
          ))}
        </>
      </Row>
    </Container>
  );
};

const AdminMastersList = ({ masters, onSelect, onRemove, isAdminView = true }) => {
  if (masters == null) return null;
  const collectionIsEmptyText = isAdminView ? 'No records yet' : 'There is no masters available at this moment which can handle your order';

  if (masters.length === 0) {
    return (
      <Container>
        <Row className="justify-content-md-center mt-3">
          <Col md="auto">
            <Alert variant="warning">{collectionIsEmptyText}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isAdminView) return <MasterTableList {...{ masters, onRemove }} />;
  return <MasterCardList {...{ masters, onSelect }} />;
};

export default AdminMastersList;
