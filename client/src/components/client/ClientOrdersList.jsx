import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { ORDER_STATUS } from '../../constants';

const ClientOrdersList = ({ orders, onReview }) => {
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
            <th className="text-center p-2 m-0">Master Name</th>
            <th className="text-center p-2 m-0">Service</th>
            <th className="text-center p-2 m-0">City</th>
            <th className="text-center p-2 m-0">Date Start</th>
            <th className="text-center p-2 m-0">Date End</th>
            <th className="text-center p-2 m-0">Total Cost</th>
            <th className="text-center p-2 m-0">Status</th>
            <th className="text-center p-2 m-0">Rate</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="m-0">
              <td className="text-center p-2 m-0">{`${order.master.name}`}</td>
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
              <td className="text-center p-2 m-0 col-1">
                {order.status === ORDER_STATUS.COMPLETED ? (
                  <>
                    {order.rating === null ? (
                      <Link to="#">
                        <ThumbUpOutlinedIcon onClick={() => onReview(order.id)} />
                      </Link>
                    ) : (
                      order.rating
                    )}
                  </>
                ) : (
                  <>&nbsp;</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ClientOrdersList;
