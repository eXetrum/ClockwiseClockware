import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Alert, Badge, Button, Spinner } from 'react-bootstrap';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import StarRating from '../common/StarRating';
import { formatDate, formatDecimal } from '../../utils';
import { ORDER_STATUS } from '../../constants';

const COLUMN_HEADERS = ['id', 'Client', 'Master', 'City', 'Clock', 'Date Start', 'Date End', 'Status', 'Total Cost'];

const AdminOrdersList = ({ orders, onRemove, onComplete, onCancel, isPending }) => {
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
              <th key={header} className="text-center p-2 m-0">
                {header}
              </th>
            ))}
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
                <small className="text-muted">{formatDate(order.startDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(order.endDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{order.status}</small>
                {order.status === ORDER_STATUS.CONFIRMED ? (
                  <Stack spacing={1}>
                    <Button onClick={() => onComplete(order.id)} size="sm" disabled={isPending} variant="success">
                      {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                      Complete
                    </Button>
                    <Button onClick={() => onCancel(order.id)} size="sm" disabled={isPending} variant="secondary">
                      {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                      Cancel
                    </Button>
                  </Stack>
                ) : null}
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDecimal(order.totalCost)}</small>
              </td>

              <td className="text-center p-2 m-0">
                {order.status === ORDER_STATUS.CONFIRMED ? (
                  <Link to={'/admin/orders/' + order.id}>
                    <EditIcon />
                  </Link>
                ) : (
                  <EditIcon sx={{ color: 'gray' }} />
                )}
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
