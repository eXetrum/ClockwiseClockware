import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import SpinnerButton from './SpinnerButton';
import { formatDecimal, formatDate, addHours } from '../../utils';

const OrderSummary = ({ order, onBack, onSubmit, isPending }) => {
  return (
    <>
      <Row className="justify-content-md-center">
        <center>
          <h4>Order summary:</h4>
        </center>
        <Col xs lg="6">
          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>Client:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">
              {order.client ? (
                <>
                  {order.client?.name}, {order.client?.email}
                </>
              ) : null}
            </Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>Master:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">
              {order.master ? (
                <>
                  {order.master?.name}, {order.master?.email}
                </>
              ) : null}
            </Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>City:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">{order?.city?.name}</Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>Watch type:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">{order?.watch?.name}</Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>Start date:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">{formatDate(order?.startDate)}</Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>End date:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">{formatDate(addHours(order?.startDate, order?.watch?.repairTime))}</Col>
          </Row>

          <hr />
          <Row>
            <Col sm={4}>
              <Form.Label>
                <b>Total Cost:</b>
              </Form.Label>
            </Col>
            <Col className="d-flex justify-content-end">{formatDecimal(order?.city?.pricePerHour)}</Col>
          </Row>

          <hr />
          <Row className="justify-content-center mt-4">
            <Col className="d-flex justify-content-start">
              <Button className="mb-3 col-sm-5" onClick={onBack} disabled={isPending}>
                Edit
              </Button>
            </Col>
            <Col className="d-flex justify-content-end">
              <SpinnerButton
                className="mb-3 col-sm-5"
                type="submit"
                onClick={onSubmit}
                variant="success"
                disabled={isPending}
                loading={isPending}
                text={'Create'}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default OrderSummary;
