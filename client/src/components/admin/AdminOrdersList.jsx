import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, Badge } from 'react-bootstrap';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import StarRating from '../common/StarRating';

const AdminOrdersList = ({ orders, onRemove }) => {
  if (orders == null) return null;

  if (orders.length === 0) {
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

  const pad = (num) => num.toString().padStart(2, '0');
  const formatDate = (date) =>
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
    ' ' +
    [pad(date.getHours()), pad(date.getMinutes())].join(':');

  const formatDecimal = (value) => parseFloat(value).toFixed(2);

  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th className="text-center p-2 m-0">id</th>
            <th className="text-center p-2 m-0">Client</th>
            <th className="text-center p-2 m-0">Master</th>
            <th className="text-center p-2 m-0">City</th>
            <th className="text-center p-2 m-0">Clock</th>
            <th className="text-center p-2 m-0">Date Start</th>
            <th className="text-center p-2 m-0">Date End</th>
            <th className="text-center p-2 m-0">Status</th>
            <th className="text-center p-2 m-0">Total Cost</th>
            <th colSpan="2" className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="m-0">
              <td className="text-center p-2 m-0 col-1">{order.id}</td>
              <td className="text-center p-2 m-0">
                <p>
                  <a className="text-muted" href={`mailto:${order.client.email}`} target="_blank" rel="noreferrer noopener">
                    <EmailOutlinedIcon />
                  </a>
                  <span>{`${order.client.name}`}</span>
                </p>
                <small className="text-muted">{order.client.email}</small>
              </td>
              <td className="text-center p-2 m-0">
                <p>
                  <a className="text-muted" href={`mailto:${order.master.email}`} target="_blank" rel="noreferrer noopener">
                    <EmailOutlinedIcon />
                  </a>
                  <span>{order.master.name}</span>
                </p>
                <small className="text-muted">{order.master.email}</small>
                <div className="text-center p-2 m-0">
                  <StarRating value={order.master.rating} readonly={true} />
                </div>
              </td>
              <td className="text-center p-2 m-0">
                <Badge className="p-2">{order.city.name}</Badge>
              </td>
              <td className="text-center p-2 m-0">
                <Badge className="p-2" bg="info">
                  {order.watch.name}
                  <Badge pill bg="secondary" className="ms-2">
                    {order.watch.repairTime}h
                  </Badge>
                </Badge>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(new Date(order.startDate))}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(new Date(order.endDate))}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{order.status}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDecimal(order.totalCost)}</small>
              </td>

              <td className="text-center p-2 m-0">
                {new Date() < new Date(order.startDate) ? (
                  <Link to={'/admin/orders/' + order.id}>
                    <EditIcon />
                  </Link>
                ) : null}
              </td>
              <td className="text-center p-2 m-0">
                <Link to="#">
                  <DeleteForeverIcon onClick={() => onRemove(order.id)} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminOrdersList;
