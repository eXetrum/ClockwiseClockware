import React from 'react';
import { Container, Row, Col, Table, Alert, Button, Spinner } from 'react-bootstrap';
import { ORDER_STATUS } from '../../constants';

const MasterOrdersList = ({ orders, onComplete, isPending }) => {
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
            <th className="text-center p-2 m-0">Client Name</th>
            <th className="text-center p-2 m-0">Service</th>
            <th className="text-center p-2 m-0">City</th>
            <th className="text-center p-2 m-0">Date Start</th>
            <th className="text-center p-2 m-0">Date End</th>
            <th className="text-center p-2 m-0">Total Cost</th>
            <th className="text-center p-2 m-0">Status</th>
            <th className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="m-0">
              <td className="text-center p-2 m-0">{`${order.client.name}`}</td>
              <td className="text-center p-2 m-0">
                Repair clock of <b>{order.watch.name}</b> type
              </td>
              <td className="text-center p-2 m-0">{order.city.name}</td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(new Date(order.startDate))}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(new Date(order.endDate))}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDecimal(order.totalCost)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{order.status}</small>
              </td>
              <td className="text-center p-2 m-0 col-2">
                {order.status === ORDER_STATUS.CONFIRMED ? (
                  <Button onClick={() => onComplete(order.id)} size="sm" disabled={isPending}>
                    {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                    Finish order
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default MasterOrdersList;
