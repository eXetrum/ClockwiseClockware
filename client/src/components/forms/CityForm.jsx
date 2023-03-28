import React, { useCallback, useMemo } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import ModalForm from './ModalForm';

import { useDispatch, useSelector } from 'react-redux';
import { changeVisibilityAddForm, changeNewCityField } from '../../store/reducers/CitySlice';

import { formatDecimal } from '../../utils';

const CityForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false }) => {
  const dispatch = useDispatch();

  const { newCity, isShowAddForm, isPending } = useSelector(state => state.cityReducer);

  const isFormValid = useMemo(() => newCity.name, [newCity]);

  const onHide = useCallback(() => dispatch(changeVisibilityAddForm(false)), [dispatch]);
  const onFormFieldChange = useCallback(({ target: { name, value } }) => dispatch(changeNewCityField({ name, value })), [dispatch]);

  const formBody = (
    <>
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
              autoFocus
              required
              value={newCity.name}
              disabled={isPending}
              onChange={onFormFieldChange}
            />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Row className="mt-2">
          <Col sm={4}>
            <Form.Label>
              <b>Price Per Hour (Employe rate):</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Control
              type="number"
              name="pricePerHour"
              required
              min={0}
              step={0.05}
              value={formatDecimal(newCity.pricePerHour)}
              disabled={isPending}
              onChange={onFormFieldChange}
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
            <Row>
              <Col sm={4}></Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid}>
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

export default CityForm;
