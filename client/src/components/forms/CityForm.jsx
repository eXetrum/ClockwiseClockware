import React, { useCallback, useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import ModalForm from './ModalForm';
import { SpinnerButton } from '../../components';

import { useDispatch, useSelector } from 'react-redux';
import { changeVisibilityAddCityForm, changeNewCityField } from '../../store/actions';
import { selectNewCity, selectCityPending, selectCityShowAddForm } from '../../store/selectors';

const CityForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false }) => {
  const dispatch = useDispatch();

  const newCity = useSelector(selectNewCity);
  const isPending = useSelector(selectCityPending);
  const isShowAddForm = useSelector(selectCityShowAddForm);

  const isFormValid = useMemo(() => newCity.name && newCity.pricePerHour !== '' && !isNaN(newCity.pricePerHour), [newCity]);

  const onHide = useCallback(() => dispatch(changeVisibilityAddCityForm(false)), [dispatch]);
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
              pattern="/([+]?([0-9]*[.])?[0-9]+)/g"
              required
              value={newCity.pricePerHour}
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

export default CityForm;
