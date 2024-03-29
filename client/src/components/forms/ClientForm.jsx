import React, { useCallback, useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import ModalForm from './ModalForm';
import SpinnerButton from '../common/SpinnerButton';

import { useDispatch, useSelector } from 'react-redux';
import { changeVisibilityAddClientForm, changeNewClientField } from '../../store/actions';
import { selectNewClient, selectClientPending, selectClientShowAddForm } from '../../store/selectors';

import { validateEmail, validateClientName } from '../../utils';

const ClientForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false, isHidePassword = false }) => {
  const dispatch = useDispatch();

  const newClient = useSelector(selectNewClient);
  const isPending = useSelector(selectClientPending);
  const isShowAddForm = useSelector(selectClientShowAddForm);

  const isFormValid = useMemo(
    () => validateEmail(newClient.email) && validateClientName(newClient.name) && (isHidePassword ? true : newClient.password),
    [newClient, isHidePassword],
  );

  const onHide = useCallback(() => dispatch(changeVisibilityAddClientForm(false)), [dispatch]);
  const onFormFieldChange = useCallback(({ target: { name, value } }) => dispatch(changeNewClientField({ name, value })), [dispatch]);

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
              onChange={onFormFieldChange}
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
                onChange={onFormFieldChange}
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
            <Form.Control type="text" name="name" required value={newClient.name} disabled={isPending} onChange={onFormFieldChange} />
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
        onHide={onHide}
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
                <SpinnerButton
                  className="ms-2"
                  type="submit"
                  variant="success"
                  loading={isPending}
                  disabled={isPending || !isFormValid}
                  text={okButtonText}
                />
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
};

export default ClientForm;
