import React, { useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import ModalForm from './ModalForm';

import { useDispatch, useSelector } from 'react-redux';
import { clientSlice } from '../../store/reducers';

import { validateEmail } from '../../utils';

const ClientForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false, isHidePassword = false }) => {
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, changeNewClientField } = clientSlice.actions;
  const { newClient, isShowAddForm, isPending } = useSelector((state) => state.clientReducer);

  const isFormValid = useCallback(
    () => newClient.email && validateEmail(newClient.email) && (isHidePassword ? true : newClient.password) && newClient.name.length >= 3,
    [newClient, isHidePassword],
  );

  const formBody = (
    <>
      <Form.Group>
        <Row className="mt-2">
          <Col sm={4}>
            <Form.Label>
              <b>Email:</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Control
              type="email"
              name="email"
              autoFocus
              required
              value={newClient.email}
              disabled={isPending}
              onChange={({ target: { name, value } }) => dispatch(changeNewClientField({ name, value }))}
            />
          </Col>
        </Row>
      </Form.Group>
      {!isHidePassword ? (
        <Form.Group>
          <Row className="mt-2">
            <Col sm={4}>
              <Form.Label>
                <b>Password:</b>
              </Form.Label>
            </Col>
            <Col>
              <Form.Control
                type="password"
                name="password"
                required
                value={newClient.password}
                disabled={isPending}
                onChange={({ target: { name, value } }) => dispatch(changeNewClientField({ name, value }))}
              />
            </Col>
          </Row>
        </Form.Group>
      ) : null}
      <Form.Group>
        <Row className="mt-2">
          <Col sm={4}>
            <Form.Label>
              <b>Name:</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Control
              type="text"
              name="name"
              required
              value={newClient.name}
              disabled={isPending}
              onChange={({ target: { name, value } }) => dispatch(changeNewClientField({ name, value }))}
            />
          </Col>
        </Row>
      </Form.Group>
    </>
  );

  if (isModal) {
    return (
      <ModalForm
        title={titleText}
        okText={okButtonText}
        show={isShowAddForm}
        isFormValid={isFormValid}
        isPending={isPending}
        formContent={formBody}
        onHide={() => dispatch(changeVisibilityAddForm(false))}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <Form onSubmit={onSubmit}>
          {formBody}
          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}></Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid()}>
                  {okButtonText}
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
