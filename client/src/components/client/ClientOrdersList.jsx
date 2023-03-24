import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert } from 'react-bootstrap';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { ORDER_STATUS } from '../../constants';
import { formatDecimal, formatDate } from '../../utils';

const COLUMN_HEADERS = ['Master Name', 'Service', 'City', 'Date Start', 'Date End', 'Total Cost', 'Status', 'Rate'];

const ClientOrdersList = ({ orders, onReview }) => {
  const toDateStr = useCallback((arg) => formatDate(arg), []);
  const toDecimalStr = useCallback((arg) => formatDecimal(arg), []);

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

  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            {COLUMN_HEADERS.map((header) => (
              <th className="text-center p-2 m-0">{header}</th>
            ))}
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
                <small className="text-muted">{toDateStr(order.startDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{toDateStr(order.endDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{toDecimalStr(order.totalCost)}</small>
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
