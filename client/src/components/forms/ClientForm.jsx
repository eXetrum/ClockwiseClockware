import React, { useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { validateEmail } from '../../utils';

const ClientForm = ({ client, onFormSubmit, onClientEmailChange, onClientNameChange, isPending, successButtonText = 'Save' }) => {
  const isFormValid = useCallback(() => client.name.length >= 3 && validateEmail(client.email), [client]);

  return (
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <Form onSubmit={onFormSubmit}>
          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}>
                <Form.Label>
                  <b>Email:</b>
                </Form.Label>
              </Col>
              <Col>
                <Form.Control type="email" name="clientEmail" onChange={onClientEmailChange} value={client.email} disabled={isPending} />
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}>
                <Form.Label>
                  <b>Name:</b>
                </Form.Label>
              </Col>
              <Col>
                <Form.Control type="text" name="clientName" onChange={onClientNameChange} value={client.name} disabled={isPending} />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col sm={4}></Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid()}>
                  {successButtonText}
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
};

export default ClientForm;
