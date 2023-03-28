import React, { useCallback } from 'react';
import { Container, Row, Col, Table, Alert, Button, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import Stack from '@mui/material/Stack';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { completeOrder } from '../../store/reducers/ActionCreators';

import { formatDate, formatDecimal } from '../../utils';
import { ORDER_STATUS } from '../../constants';

const COLUMN_HEADERS = ['Client Name', 'Service', 'City', 'Date Start', 'Date End', 'Total Cost', 'Status'];

const MasterOrdersList = ({ orders }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const onComplete = useCallback(
    async order => {
      const result = await confirm(`Do you want to mark order with id=${order.id} as completed ?`, {
        title: 'Confirm',
        okText: 'Completed',
        okButtonStyle: 'success',
      });
      if (!result) return;

      const action = await dispatch(completeOrder(order.id));

      if (isFulfilled(action)) enqueueSnackbar(`Order "${order.id}" maked as completed`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

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
            {COLUMN_HEADERS.map(header => (
              <th key={header} className="text-center p-2 m-0">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="m-0">
              <td className="text-center p-2 m-0">{`${order.client.name}`}</td>
              <td className="text-center p-2 m-0">
                Repair clock of <b>{order.watch.name}</b> type
              </td>
              <td className="text-center p-2 m-0">{order.city.name}</td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(order.startDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDate(order.endDate)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{formatDecimal(order.totalCost)}</small>
              </td>
              <td className="text-center p-2 m-0">
                <small className="text-muted">{order.status}</small>
                {order.status === ORDER_STATUS.CONFIRMED ? (
                  <Stack spacing={1}>
                    <Button onClick={() => onComplete(order)} size="sm" variant="success" disabled={order.isCompleting}>
                      {order.isCompleting ? (
                        <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                      ) : null}
                      Complete
                    </Button>
                  </Stack>
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
